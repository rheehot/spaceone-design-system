<template>
    <p-toolbox-table
        class="p-dynamic-layout-query-search-table"
        v-bind="extra"
        :items="data"
        :fields="fields"
        :loading="loading"
        sortable
        selectable
        :select-index.sync="selectIndex"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :this-page.sync="thisPage"
        :page-size.sync="pageSize"
        v-on="$listeners"
    >
        <!--        @changePageSize="getData"-->
        <!--        @changePageNumber="getData"-->
        <!--        @clickRefresh="getData"-->
        <!--        @changeSort="getData"-->
        <!--        @clickExcel="exportExcel"-->
        <template #toolbox-top>
            <slot v-if="showTitle||$scopedSlots['toolbox-top']" name="toolbox-top">
                <p-panel-top v-if="showTitle"
                             style="margin: 0; margin-top: 0.5rem;"
                             :use-total-count="true"
                >
                    <!--                    :total-count="apiHandler.totalCount.value"-->
                    {{ name }}
                </p-panel-top>
            </slot>
        </template>
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search v-model="searchText"
                                :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex flex-col flex-1">
                <p-query-search v-model="searchText"
                                class="block lg:hidden mt-4"
                                :class="{ 'mb-4':!!$scopedSlots['toolbox-bottom']&&tags.length===0}"
                                :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
                <div v-if="tags.length !==0" class="mt-4" :class="{ 'mb-4':$scopedSlots['toolbox-bottom']}">
                    <p-hr style="width: 100%;" />
                    <p-query-search-tags style="margin-top: 0.5rem;"
                                         :tags="tags"
                                         @delete:tag="deleteTag"
                                         @delete:all="deleteAllTags"
                    />
                </div>
                <slot name="toolbox-bottom" />
            </div>
        </template>
        <template v-for="slot of slots" v-slot:[slot.name]="data">
            <slot :name="slot.name" v-bind="data">
                <p-dynamic-field :key="slot.key" v-bind="slot" :data="data.value" />
            </slot>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onMounted, reactive, toRefs, ref,
} from '@vue/composition-api';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';

import PHr from '@/components/atoms/hr/PHr.vue';
import { DynamicLayoutProps } from '@/components/organisms/dynamic-layout/type';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { DataTableFieldType } from '@/components/organisms/tables/data-table/PDataTable.toolset';
import { getTimezone } from '@/lib/util';
import { DynamicField } from '@/components/organisms/dynamic-field/type';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { QueryItem } from '@/components/organisms/search/query-search/type';

const makeFields = (props: DynamicLayoutProps|any) => computed<DataTableFieldType[]>(() => {
    if (!props.options.fields) return [];

    return props.options.fields.map(ds => ({
        name: ds.key,
        label: ds.name,
        sortable: typeof ds.options?.sortable === 'boolean' ? ds.options.sortable : true,
        // eslint-disable-next-line camelcase
        sortKey: ds.options?.sort_key,
        width: ds.options?.width,
    }));
});

const makeTableSlots = (props: DynamicLayoutProps|any) => computed((): DynamicField[] => (
    props.options.fields ? props.options.fields.map((ds) => {
        const res = {
            ...ds,
            name: `col-${ds.key}-format`,
        };
        if (res.type === 'datetime') {
            if (!res.extra) res.extra = {};
            if (!res.extra.timezone) res.extra.timezone = getTimezone();
        }
        return res;
    }) : []));

const bindExtraDataOrInit = (name: string, props: DynamicLayoutProps, init?: any) => {
    if (props.extra[name]) return computed(() => props.extra[name]);
    return props.extra[name] || init;
};

export default {
    name: 'PDynamicLayoutQuerySearchTable',
    components: {
        PQuerySearch,
        PDynamicField,
        PToolboxTable,
        PHr,
        PQuerySearchTags,
        PPanelTop,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: Array,
            default: () => [],
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
        exportFields: {
            type: Array,
            default: null,
        },
        loading: {
            type: Boolean,
            default: true,
        },
        extra: {
            type: Object,
            default: () => ({
            }),
        },
    },
    setup(props: DynamicLayoutProps, { emit }) {
        const vm = getCurrentInstance() as ComponentInstance;
        const state = reactive({
            /* table */
            fields: makeFields(props),
            selectIndex: bindExtraDataOrInit('selectIndex', props),
            sortBy: bindExtraDataOrInit('sortBy', props),
            sortDesc: bindExtraDataOrInit('sortDesc', props),
            thisPage: bindExtraDataOrInit('thisPage', props),
            pageSize: bindExtraDataOrInit('pageSize', props),
            slots: makeTableSlots(props),

            /* query search */
            valueHandlerMap: bindExtraDataOrInit('valueHandlerMap', props, {}),
            tags: bindExtraDataOrInit('tags', props, []) as QueryTag[],
            searchText: bindExtraDataOrInit('searchText', props) as string,

        });


        const validation = (query: QueryItem): boolean => (state.tags as unknown as QueryTag[]).every((tag) => {
            if (tag.key && query.key) {
                return (query.key.name !== tag.key.name
                    || query.operator !== tag.operator
                    || query.value !== tag.value);
            }
            if (!tag.key && !query.key) {
                return query.value !== tag.value;
            }
            return true;
        });

        const setTags = (tags: QueryItem[]): void => {
            (state.tags as unknown as QueryTag[]) = tags;
        };

        const onSearch = async (query?: QueryItem) => {
            const val = query;
            if (!val) return;
            if (validation(val)) return;
            setTags([...(state.tags as unknown as QueryTag[]), val]);
        };

        const deleteTag = (idx: number) => {
            const updatedTags = [...state.tags] as unknown as QueryTag[];
            updatedTags.splice(idx, 1);
            setTags(updatedTags);
        };
        const deleteAllTags = () => {
            setTags([]);
        };

        return {
            ...toRefs(state),
            onSearch,
            deleteTag,
            deleteAllTags,
        };
    },
};
</script>
<style lang="postcss" scoped>
    .left-toolbox-item {
        &:last-child {
            flex-grow: 1;
        }
    }
    .p-dynamic-layout-query-search-table {
        >>> .toolbox {
            .toolbox-bottom {
                @apply mt-0;
            }
        }
    }
</style>