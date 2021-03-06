<template>
    <div class="p-data-table">
        <div class="table-container">
            <table ref="table"
                   :class="{
                       striped: striped,
                       bordered: bordered,
                       'no-hover': !hover,
                       [tableStyleType]: true,
                   }"
                   :style="{ width: getTableWidth() }"
            >
                <thead>
                    <slot name="head" :fields="fieldsData">
                        <tr v-if="showHeader" class="fade-in">
                            <th v-if="selectable" class="all-select">
                                <p-check-box v-if="multiSelect"
                                             v-model="allState"
                                             @change="selectAllToggle"
                                />
                            </th>
                            <th
                                v-for="(field, index) in fieldsData"
                                :key="index"
                                :style="{
                                    minWidth: field.width || undefined,
                                    width: field.width || undefined,
                                }"
                                :class="{'fix-width': colCopy}"
                                @click="theadClick(field, index, $event)"
                                @mouseenter="thHoverIndex=index"
                                @mouseleave="thHoverIndex=null"
                            >
                                <slot :name="`th-${field.name}`" :index="index" :field="field"
                                      :sortable="sortable"
                                >
                                    <span class="th-contents">
                                        <span>
                                            {{ field.label ? field.label : field.name }}
                                            <p-copy-button v-if="colCopy"
                                                           class="ml-2"
                                                           @copy="clickColCopy(index)"
                                            />
                                        </span>

                                        <template v-if="sortable && field.sortable">
                                            <p-i
                                                v-if="sortable && (field.sortKey|| field.name) === sortBy"
                                                :name="sortIcon"
                                                class="sort-icon"
                                            />
                                            <p-i v-else
                                                 name="ic_table_sort"
                                                 class="sort-icon"
                                            />
                                        </template>
                                    </span>
                                </slot>
                            </th>
                        </tr>
                    </slot>
                </thead>
                <tbody>
                    <slot v-if="showNoData" name="no-data" :fields="fieldsData">
                        <div class="no-data">
                            No Items
                        </div>
                        <tr :colspan="selectable ? fieldsData.length +1 : fieldsData.length" class="fake-row" />
                    </slot>
                    <slot name="body" :items="items">
                        <slot v-for="(item, index) in items" name="row" :fields="fieldsName"
                              :item="item" :index="index"
                        >
                            <slot :name="'row-'+index"
                                  :item="item"
                                  :index="index"
                                  :fields="fieldsName"
                            >
                                <tr :key="index" :data-index="index"
                                    class="fade-in"
                                    :class="{
                                        'tr-selected': isSelected(index),
                                        'row-height-fixed': rowHeightFixed
                                    } "
                                    v-bind="(item&& item.hasOwnProperty('vbind') )? item.vbind : null"
                                    @click.left="rowLeftClick( item, index, $event )"
                                    @click.right="rowRightClick( item, index, $event )"
                                    @click.middle="rowMiddleClick( item, index, $event )"
                                    @mouseover="rowMouseOver(item,index, $event)"
                                    @mouseout="rowMouseOut(item,index, $event)"
                                >
                                    <td v-if="selectable"
                                        class="select-checkbox"
                                        @click.stop.prevent="selectClick"
                                        @mouseenter="hoverIndex=index"
                                        @mouseleave="hoverIndex=null"
                                    >
                                        <p-check-box v-if="multiSelect"
                                                     v-model="proxySelectIndex"
                                                     :value="index"
                                                     :hovered="hoverIndex===index"
                                        />
                                        <p-radio v-else
                                                 v-model="proxySelectIndex[0]"
                                                 :value="index"
                                                 :hovered="hoverIndex===index"
                                        />
                                    </td>
                                    <slot v-for="(field, i) in fieldsName"
                                          :name="'col-'+field"
                                          :item="item"
                                          :value=" item? item[field] :''"
                                          :index="index"
                                          :field="field"
                                    >
                                        <td :key="i"
                                            v-tooltip.bottom="{content: getTooltipContent(item, field, index, i), delay: {show: 500}}"
                                        >
                                            <slot
                                                :name="'col-'+field+'-format'"
                                                :item="item"
                                                :value="getValueFunc(item,field)"
                                                :index="index"
                                                :field="field"
                                            >
                                                {{ getValueFunc(item,field) }}
                                            </slot>
                                        </td>
                                    </slot>
                                </tr>
                            </slot>
                        </slot>
                    </slot>
                </tbody>
                <tfoot>
                    <slot name="foot" />
                </tfoot>
            </table>
        </div>
        <slot v-if="showLoading" name="loading">
            <div class="loading-backdrop fade-in" />
            <p-lottie name="thin-spinner" :size="2.5"
                      :auto="true" class="loading"
            />
        </slot>
    </div>
</template>

<script lang="ts">
import {
    toRefs, computed, reactive, watch, onMounted, Ref, ref,
} from '@vue/composition-api';
import {
    flatMap, range, get, every,
} from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { copyAnyData, selectToCopyToClipboard } from '@/components/util/helpers';
import { windowEventMount } from '@/components/util/composition-helpers';
import { tableProps } from '@/components/molecules/tables/PTable.toolset';
import { DataTableField, DataTableSetupProps } from './PDataTable.toolset';

const PCheckBox = () => import('@/components/molecules/forms/checkbox/PCheckBox.vue');
const PRadio = () => import('@/components/molecules/forms/radio/PRadio.vue');
const PCopyButton = () => import('@/components/molecules/buttons/copy-button/PCopyButton.vue');


export default {
    name: 'PDataTable',
    components: {
        // PSkeleton,
        PI,
        PCheckBox,
        PCopyButton,
        PLottie,
        PRadio,
    },
    props: {
        ...tableProps,
        fields: Array,
        items: Array,
        sortable: {
            type: Boolean,
            default: false,
        },
        selectable: {
            type: Boolean,
            default: false,
        },
        selectIndex: {
            type: [Array, Number],
            default: () => [],
        },
        sortBy: {
            type: String,
            default: null,
        },
        sortDesc: {
            type: Boolean,
            default: true,
        },
        colCopy: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: undefined,
        },
        useCursorLoading: {
            type: Boolean,
            default: false,
        },
        skeletonRows: {
            type: Number,
            default: 5,
        },
        rowClickMultiSelectMode: {
            type: Boolean,
            default: false,
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: DataTableSetupProps, context) {
        const state = reactive({
            table: null,
            allState: false,
            hoverIndex: null,
            thHoverIndex: null,
        });
        const proxySelectIndex: Ref<number[]> = computed({
            set(val) {
                context.emit('update:selectIndex', val);
                context.emit('select', val);
            },
            get() { return props.selectIndex; },
        }) as unknown as Ref<number[]>;
        const fieldsData: Ref<any> = computed(() => {
            const data = flatMap(props.fields, (value: string|object) => {
                if (typeof value === 'string') { return { name: value, label: value, sortable: true }; }
                return { sortable: true, ...value };
            });
            return data;
        });

        const fieldsName = computed(() => flatMap(fieldsData.value, field => field.name));
        const sortIcon = computed(() => (props.sortDesc ? 'ic_table_sort_fromZ' : 'ic_table_sort_fromA'));
        // @ts-ignore
        const copyTargetElement = computed(() => state.table.children[1].children);

        const showLoading = ref(true);
        const showHeader = ref(false);
        const showNoData = computed(() => {
            if (showHeader.value && (
                !props.items || !Array.isArray(props.items) || props.items.length === 0
            )) {
                return true;
            }
            return false;
        });
        const skeletons = computed(() => range(props.skeletonRows));

        const makeTableText = (el) => {
            let result = '';
            const startIdx = props.selectable ? 1 : 0;
            const tds = el.children;
            // eslint-disable-next-line no-plusplus
            for (let idx = startIdx; idx < el.childElementCount; idx++) {
                result += `${tds[idx].innerText}\t`;
            }
            return `${result}\n`;
        };
        const copy = (event) => {
        /**
         * TODO: single select copy
         */
            const hasSelectData = () => {
                const selection = document.getSelection();
                if (selection && selection.type === 'Range') {
                    return true;
                }
                return false;
            };

            if (!hasSelectData()) {
                if (!props.multiSelect) return;

                if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey) && (proxySelectIndex.value as Array<any>).length > 0) {
                    let result = '';
                    if (Array.isArray(proxySelectIndex.value)) {
                        proxySelectIndex.value.forEach((tr) => {
                            result += makeTableText(copyTargetElement.value[tr]);
                        });
                    }
                    selectToCopyToClipboard(result);
                }
            }
        };
        const isSelected = index => (props.multiSelect ? proxySelectIndex.value.indexOf(index) !== -1 : proxySelectIndex.value[0] === index);
        const checkboxToggle = (index) => {
            const newSelected = [...proxySelectIndex.value];
            if (isSelected(index)) {
                const idx = newSelected.indexOf(index);
                newSelected.splice(idx, 1);
                state.allState = false;
            } else {
                newSelected.push(index);
            }
            proxySelectIndex.value = newSelected;
        };
        const rowLeftClick = (item, index, event) => {
            context.emit('rowLeftClick', item, index, event);
            if (!props.selectable) return;
            if (props.multiSelect) {
                if (props.rowClickMultiSelectMode) {
                    checkboxToggle(index);
                    return;
                }
                if (event.shiftKey) {
                    checkboxToggle(index);
                    return;
                }
            }
            proxySelectIndex.value = [index];
        };
        const rowRightClick = (item, index, event) => {
            context.emit('rowRightClick', item, index, event);
        };
        const rowMiddleClick = (item, index, event) => {
            context.emit('rowMiddleClick', item, index, event);
        };
        const rowMouseOver = (item, index, event) => {
            context.emit('rowMouseOver', item, index, event);
        };
        const rowMouseOut = (item, index, event) => {
            context.emit('rowMouseOut', item, index, event);
        };
        const theadClick = (field, index, event) => {
            if (props.sortable && field.sortable) {
                let sortBy = field.sortKey || field.name;
                const sortDesc = props.sortDesc;

                if (props.sortBy !== sortBy) {
                    context.emit('update:sortBy', sortBy);
                    if (!sortDesc) {
                        context.emit('update:sortDesc', true);
                    }
                } else {
                    if (!sortDesc) {
                        sortBy = '';
                        context.emit('update:sortBy', '');
                    }
                    context.emit('update:sortDesc', !sortDesc);
                }

                context.emit('changeSort', sortBy, sortDesc);
            }
            context.emit('theadClick', field, index, event);
        };

        const selectClick = (event) => {
            event.target.children[0].click();
        };
        const selectAllToggle = () => {
            if (state.allState) {
                proxySelectIndex.value = Array.from(new Array(props.items.length).keys());
            } else {
                proxySelectIndex.value = [];
            }
        };
        const getSelectItem = (sortable) => {
            const selectedIndex = sortable ? proxySelectIndex.value : proxySelectIndex.value.sort((a, b) => a - b);
            const selectItem = [];
            // @ts-ignore
            selectedIndex.forEach((index) => {
                // @ts-ignore
                selectItem.push(props.items[index]);
            });
            return selectItem;
        };
        const clickColCopy = (idx) => {
            let result = '';
            const arr = Array.from(copyTargetElement.value as any[]);
            arr.forEach((el) => {
                // @ts-ignore
                const children = Array.from(el.children);
                children.forEach((td, colIdx) => {
                    if (colIdx === idx) {
                        // @ts-ignore
                        result += `${td.innerText}\t`;
                    }
                });
            });
            copyAnyData(result);
        };

        if (props.selectable) {
            windowEventMount('keydown', copy);
        }


        watch(() => proxySelectIndex.value, () => {
            if (props.items && props.items.length && props.items.length === (proxySelectIndex.value as any[]).length) {
                state.allState = true;
            } else {
                state.allState = false;
            }
        });

        onMounted(() => {
            if (props.useCursorLoading && props.loading) {
                document.body.style.cursor = 'progress';
            }
        });
        watch(() => props.loading, (value) => {
            if (typeof value !== 'boolean') {
                showHeader.value = true;
                showLoading.value = false;
                return;
            }

            if (props.useCursorLoading) {
                if (value) {
                    document.body.style.cursor = 'progress';
                } else {
                    document.body.style.cursor = 'default';
                }
            }

            if (value) {
                showLoading.value = true;
            } else {
                if (!showHeader.value) showHeader.value = true;
                showLoading.value = false;
            }
        });


        const getValueFunc = computed(() => {
            if (every(fieldsName.value, field => !field.includes('.'))) {
                return (item, field) => item[field] || '';
            }
            return (item, field) => get(item, field, '');
        });

        const getTableWidth = () => {
            if (props.width) return props.width;
            // if (!props.colWidth) return undefined;
            // const num = props.colWidth.match(/\d+/g);
            // const unit = props.colWidth.match(/[a-zA-Z]+/g);
            // if (num && unit) return `${Number(num[0]) * props.fields.length}${unit[0]}`;
            return undefined;
        };

        const trElements = computed(() => {
            if (!state.table) return null;

            const trEls = (state.table as any).children[1];
            if (!trEls) return null;

            if (trEls.children) return Array.from(trEls.children);
            return null;
        });
        const getTooltipContent = (item: any, field: DataTableField, rowIndex: number, colIndex: number) => {
            let res;
            if (typeof field === 'string') res = item[field];
            else res = item[field.name];

            if (trElements.value) {
                // console.debug('tbodyEl.', trElements.value);
            }
            // let result = '';
            // const arr = Array.from(copyTargetElement.value as any[]);
            // arr.forEach((el) => {
            //     // @ts-ignore
            //     const children = Array.from(el.children);
            //     children.forEach((td, colIdx) => {
            //         if (colIdx === colIndex) {
            //             // @ts-ignore
            //             result += `${td.innerText}\t`;
            //         }
            //     });
            // });
            return '';
        };


        return {
            ...toRefs(state),
            proxySelectIndex,
            fieldsData,
            fieldsName,
            sortIcon,
            showNoData,
            showLoading,
            showHeader,
            isSelected,
            rowLeftClick,
            rowRightClick,
            rowMiddleClick,
            rowMouseOver,
            rowMouseOut,
            theadClick,
            selectClick,
            selectAllToggle,
            getSelectItem,
            clickColCopy,
            getValueFunc,
            skeletons,
            getTableWidth,
            getTooltipContent,
        };
    },

};
</script>

<style lang="postcss">

    @define-mixin table-theme $th-bg-color, $stripe-bg-color, $border-color, $hover-color {
        /* th */
        th {
            background-color: $th-bg-color;
            height: 2rem;
        }
        &.bordered {
            td {
                border-bottom: 1px solid $border-color;
            }
        }
        tr {
            &.tr-selected {
                @apply text-secondary bg-blue-200;
            }
            &:not(.no-hover):hover {
                background-color: $hover-color;
            }
        }
        &.striped {
            tr:nth-of-type(odd) {
                background-color: $stripe-bg-color;
            }
            tr:nth-of-type(even) {
                background-color: transparent;
            }
            tr:not(.no-hover):hover {
                background-color: $hover-color;
            }
        }
    }

    .p-data-table {
        @apply h-full w-full relative overflow-auto;
        .table-container {
            @apply h-full w-full;
        }
        table {
            @apply min-w-full;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
        }
        th {
            position: sticky;
            z-index: 1;
            top: 0;
            line-height: 2;
            font-size: 0.875rem;
            text-align: left;
            letter-spacing: 0;
            white-space: nowrap;
            border-top: 1px solid black;
            border-bottom: 1px solid black;
            .th-contents {
                @apply flex justify-between pl-4 py-1;
            }
            .sort-icon {
                @apply text-gray-500 float-right my-px;
                &:hover { cursor: pointer; }
            }
            &.fix-width {
                @apply min-w-19;
            }
            &:last-child {
                .th-contents {
                    @apply pr-2;
                }
            }
            &.all-select {
                @apply py-1 pl-4;
                width: 2.5rem;
                min-width: 2.5rem;
                max-width: 2.5rem;
            }
        }
        td {
            @apply h-10 px-4 z-0 align-middle min-w-28 text-sm leading-normal;
            vertical-align: middle;
        }
        tr {
            &.row-height-fixed {
                td {
                    @apply truncate;
                }
            }
        }

        .select-checkbox {
            @apply cursor-pointer min-w-4 w-4;
        }

        .no-data {
            @apply absolute justify-center items-center flex w-full h-full text-gray-300 text-center;
            line-height: 120%;
            font-size: 1.125rem;
            max-height: 16.875rem;
            top: 0;
        }

        .loading-backdrop {
            @apply absolute w-full h-full overflow-hidden;
            background-color: white;
            opacity: 0.5;
            top: 0;
            z-index: 1;
        }

        .loading {
            @apply absolute flex w-full h-full justify-center items-center;
            top: 0;
            max-height: 16.875rem;
        }

        .fake-row {
            @apply opacity-0;
        }

        /* transitions */
        .fade-in-enter-active {
            transition: opacity 0.2s;
        }
        .fade-in-leave-active {
            transition: opacity 0.2s;
        }
        .fade-in-enter, .fade-in-leave-to {
            opacity: 0;
        }
        .fade-in-leave, .fade-in-enter-to {
            opacity: 0.5;
        }

        /* themes */
        .default {
            @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
        }

        .light {
            @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
            th {
                border-bottom: 1px solid theme('colors.gray.200');
            }
        }

        .primary4 {
            @mixin table-theme theme('colors.white'), transparent, theme('colors.white'), transparent;
            tr {
                @apply bg-primary4;
            }
            &.bordered {
                td {
                    border-bottom-width: 4px;
                }
            }
        }
    }

</style>
