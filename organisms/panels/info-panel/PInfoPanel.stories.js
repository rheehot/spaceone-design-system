import { ref } from '@vue/composition-api';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PInfoPanel from '@/components/organisms/panels/info-panel/PInfoPanel.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { makeItems } from '@/components/util/generator';

export default {
    title: 'organisms/panel/InfoPanel',
    component: PInfoPanel,
    parameters: {
        info: {
            summary: '',
            components: { PInfoPanel },
        },
    },
};


/**
 * propName: {
 *      default: object('propName', {}),
 * }
 */
const getProps = () => ({
    infoTitle: {
        default: text('infoTitle', 'Information'),
    },
    defs: {
        default: object('defs', [
            {
                name: 'id',
                label: 'ID',
                copyFlag: true,
            },
            {
                name: 'name',
                label: 'NAME',
            },
            {
                name: 'state',
                label: 'state',
                copyFlag: true,
            },
        ]),
    },
    item: {
        default: object('item', {
            name: '펭수',
            id: 'ebs',
            state: 'KMJ',
        }),
    },
});

export const defaultCase = () => ({
    components: { PInfoPanel },
    props: getProps(),
    template: `<div style="width: 80vw;">
        <p-info-panel v-bind="$props"></p-info-panel>
    </div>`,
});

export const withTRHelper = () => ({
    components: { PInfoPanel, PBadge },
    template: `
<div style="width: 80vw;">
    <p-info-panel :infoTitle="renderTitle" :defs="defs" :item="item">
    <template #def-state-format="scope">
    <p-badge styleType="primary">{{scope.value}}</p-badge>
</template>
</p-info-panel>
</div>`,

    setup(props, context) {
        const sampleDefs = ref([
            ['name', 'NAME'],
            ['state', 'STATE', { copyFlag: true }],
            ['primary_ip_address', 'P', { copyFlag: true }],
        ]);
        return {
            renderTitle: 'Information',
            defs: makeItems(sampleDefs.value),
            item: {
                name: '펭수',
                state: '하태하태',
                primary_ip_address: '1.1.1.1',
            },
        };
    },
});
