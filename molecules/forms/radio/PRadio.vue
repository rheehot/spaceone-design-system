<template>
    <span class="p-radio"
          :class="{
              selected: isSelected,
              hovered: hovered || mouseover,
              disabled, errored
          }"
          @mouseenter="mouseover = true"
          @mouseleave="mouseover = false"
          @click.stop.prevent="onClick"
          v-on="$listeners"
    >
        <input type="radio">
        <slot :slot-scope="$props" name="icon">
            <p-i class="radio-icon" width="1.25rem" height="1.25rem"
                 :name="iconName"
            />
        </slot>
        <span v-if="$scopedSlots.default" class="text" @click.stop="onClick">
            <slot name="default" />
        </span>
    </span>
</template>

<script>
import { ref, computed } from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'PRadio',
    events: ['change'],
    components: { PI },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        selected: [Boolean, String, Number, Object, Array],
        value: {
            type: [Boolean, String, Number, Object, Array],
            default: true,
        },
        hovered: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        errored: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const isSelected = computed(() => props.selected === props.value);

        const onClick = () => {
            if (!isSelected.value) {
                if (typeof props.selected === 'object') {
                    if (props.selected instanceof Array) emit('change', [...props.value], isSelected.value);
                    else emit('change', { ...props.value }, isSelected.value);
                } else emit('change', props.value, isSelected.value);
            }
        };

        const mouseover = ref(false);

        const iconName = computed(() => {
            if (props.disabled) return 'ic_radio--disabled';
            if (isSelected.value) return 'ic_radio--checked';
            return 'ic_radio';
        });
        return {
            isSelected,
            iconName,
            onClick,
            mouseover,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-radio {
    input {
        position: absolute;
        opacity: 0;
        height: 0;
        width: 0;
    }
    .radio-icon {
        @apply text-gray-300 cursor-pointer;
    }
    .text {
        @apply cursor-pointer;
    }
    .disabled {
        .text {
            @apply cursor-not-allowed;
        }
    }
}
</style>
