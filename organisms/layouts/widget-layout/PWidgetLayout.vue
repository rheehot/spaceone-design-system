<template>
    <p-pane-layout class="widget-layout">
        <slot name="top">
            <div class="top">
                <slot name="title">
                    <span class="title" :style="titleStyle">{{ title }}</span>
                </slot>
                <slot name="help" :help="help">
                    <p-tooltip-button v-if="help"
                                      class="help" :tooltip="help"
                                      position="top" theme="gray"
                    >
                        <template #button>
                            <p-i name="ic_tooltip"
                                 width="1rem" height="1rem"
                                 color="inherit transparent"
                            />
                        </template>
                    </p-tooltip-button>
                </slot>
                <div class="flex-grow">
                    <slot name="extra" />
                </div>
            </div>
            <slot name="sub-title">
                <p class="sub-title"> {{ subTitle }}</p>
            </slot>
        </slot>
        <div class="widget-contents">
            <slot />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/PTooltipButton.vue';
import {
    widgetLayoutProps,
    WidgetLayoutPropsType,
} from '@/components/organisms/layouts/widget-layout/PWidgetLayout.toolset';

export default {
    name: 'PWidgetLayout',
    components: { PPaneLayout, PI, PTooltipButton },
    props: widgetLayoutProps,
    setup(props: WidgetLayoutPropsType) {
        return {};
    },
};
</script>

<style lang="postcss" scoped>
    .widget-layout {
        display: inline-flex;
        flex-direction: column;
        width: 100%;

        .top {
            @apply flex items-center mx-6 mt-8;
        }

        .title {
            @apply text-lg capitalize font-bold mr-2;
            line-height: 120%;
            margin-bottom: 0.03125rem;
        }

        .sub-title {
            @apply mx-6 text-xs mb-4;
        }

        .help {
            @apply text-gray-300;
            display: inline-flex;
            cursor: help;
        }

        .widget-contents {
            padding: 0 1.5rem 2.5rem 1.5rem;
            flex-grow: 1;
        }
    }
</style>
