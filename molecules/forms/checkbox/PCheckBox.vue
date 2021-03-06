<template>
    <span class="p-checkbox"
          @mouseenter="mouseover=true"
          @mouseleave="mouseover=false"
          @click.stop.prevent="onClick"
          v-on="$listeners"
    >
        <input type="checkbox">
        <slot :slot-scope="$props" name="icon">
            <p-i class="check-icon" width="1.25rem" height="1.25rem"
                 :name="checkBoxBind"
            />
        </slot>
        <span v-if="$scopedSlots.default" class="text" @click.stop="onClick">
            <slot name="default" />
        </span>
    </span>
</template>

<script lang="ts">
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import {
    computed, reactive, ref, toRefs,
} from '@vue/composition-api';

export default {
    name: 'PCheckBox',
    components: { PI },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        value: [Boolean, String, Number, Object],
        selected: [Boolean, Array],
        hovered: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const state = reactive({
            mouseover: false,
            isSelected: computed(() => {
                if (typeof props.selected === 'boolean') {
                    return props.selected;
                }
                return _.indexOf(props.selected, props.value) !== -1;
            }),
            checkBoxBind: computed(() => {
                let name = 'ic_checkbox';
                if (state.isSelected) {
                    name = 'ic_checkbox--checked';
                } else if (props.hovered || props.mouseover) {
                    name = 'ic_checkbox--hover';
                }
                return name;
            }),
        });
        const onClick = () => {
            if (typeof props.selected === 'boolean') {
                context.emit('change', !props.selected);
            } else {
                const newResult = [...props.selected];
                if (state.isSelected) {
                    _.pull(newResult, props.value);
                } else { newResult.push(props.value); }
                context.emit('change', newResult, state.isSelected);
            }
        };
        return {
            ...toRefs(state),
            onClick,

        };
    },
    methods: {

    },
};
</script>

<style lang="postcss" scoped>
    .p-checkbox {
        input{
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }
        .check-icon {
            @apply text-gray-300 cursor-pointer;
        }
    }
</style>
