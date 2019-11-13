import styles from '@/styles/_variables.scss';

export const HORIZONTAL_OPTIONS = Object.freeze({
    labels: {
        padTop: 8,
        padBottom: 4,
        textHeight: 14,
        valueFontWeight: 'bold',
    },
    bars: {
        thickness: 8,
        styles: {
            // fill: styles.primary1,
        },
        backBar: {
            display: true,
            styles: {
                // fill: styles.primary3,
            },
        },
    },
});

export const SAMPLE_DATA = [
    { key: 'Bob', value: parseInt(Math.random() * 10) },
    { key: 'Robin', value: parseInt(Math.random() * 10) },
    { key: 'Anne', value: parseInt(Math.random() * 10) },
    { key: 'Mark', value: parseInt(Math.random() * 10) },
    { key: 'Joe', value: parseInt(Math.random() * 10) },
    { key: 'Eve', value: parseInt(Math.random() * 10) },
    { key: 'Mary', value: parseInt(Math.random() * 10) },
];

export const sampleDataGenerator = function () {
    const start = Math.round(Math.random() * 10);
    return SAMPLE_DATA.slice(start < SAMPLE_DATA.length ? start : 0);
};