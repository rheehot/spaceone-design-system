import { action } from '@storybook/addon-actions';
import PTabBar from '@/components/molecules/tabs/tab-bar/PTabBar.vue';

export default {
    title: 'molecules/tabs/TabBar',
    component: PTabBar,
    parameters: {
        info: {
            summary: '',
            components: { PTabBar },
        },
    },
};
const actions = {
    changeTab: action('changeTab'),
};
const data = {
    tabs: [
        { name: 'detail', label: '디테일' },
        { name: 'info', label: '정보' },
        { name: 'tags', label: '태그' },
    ],
    activeTab: 'detail',
};

export const DefaultCase = () => ({
    components: { PTabBar },
    template: `
<div>


<p-tab-bar 
    :tabs="tabs" 
    :activeTab.sync="activeTab"
    @changeTab="changeTab"
 />
 <p>{{activeTab}}</p>
 <input type="text" v-model="activeTab">
 </div>
`,
    data() {
        return {
            ...data,
        };
    },

    methods: {
        ...actions,
    },
});
