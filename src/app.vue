<script setup lang="ts">

import { ref } from 'vue'
import { Line } from 'vue-chartjs'
import flatPickr from 'vue-flatpickr-component';
import moment from 'moment';
import 'flatpickr/dist/flatpickr.css';
import 'chart.js/auto'

const config = ref({
    altFormat: 'M j, Y',
    altInput: true,
    dateFormat: 'Y-m-d',
});


const { data } = await useFetch('/api/currentprice');
/**
 * состояние, чтобы отследить, загрузились ли данные
 */
const isDataLoaded = ref(false);

const timePeriod = ref('all');

const startDate = ref(moment().subtract(1, 'month').format('YYYY-MM-DD')); // Начальная дата, например, месяц назад
const endDate = ref(moment().format('YYYY-MM-DD')); // Конечная дата, например, сегодня

watch([startDate, endDate], () => {
    isDataLoaded.value = false;
    updateCustom();
    isDataLoaded.value = true;
});


watch(timePeriod, () => {
    isDataLoaded.value = false;
    updateChartData();
    isDataLoaded.value = true;
});

const updateCustom = () => {
    let filteredData = [];

    const newData = JSON.parse(JSON.stringify(data.value))
    const rawData = [...newData].sort((a, b) =>
        moment(a.updated_at).diff(moment(b.updated_at))
    );
    filteredData = rawData.filter(dataItem => {
        const dataDate = moment(dataItem.updated_at);
        return dataDate.isSameOrAfter(moment(startDate.value)) && dataDate.isSameOrBefore(moment(endDate.value));
    });

    console.log(filteredData);

    const newChartData = {
        labels: filteredData.map(dataItem =>
            moment(dataItem.updated_at).format('YYYY MMM DD')),
        datasets: [
            {
                label: 'BTC',
                backgroundColor: '#758cff',
                borderColor: "#758cff",
                data: filteredData.map(dataItem => dataItem.rate)
            }
        ]
    };

    chartData.value = newChartData;
};

const updateChartData = () => {
    let filteredData = [];
    const newData = JSON.parse(JSON.stringify(data.value))
    const rawData = [...newData].sort((a, b) =>
        moment(a.updated_at).diff(moment(b.updated_at))
    );

    switch (timePeriod.value) {
        case 'day':
            filteredData = rawData.filter(data => moment(data.updated_at).isBetween(moment().subtract(2, 'days'), moment()));
            break;
        case 'week':
            filteredData = rawData.filter(data => moment(data.updated_at).isBetween(moment().subtract(8, 'days'), moment()));
            break;
        case 'month':
            filteredData = rawData.filter(data => moment(data.updated_at).isBetween(moment().subtract(1, 'month'), moment()));
            break;
        case 'year':
            filteredData = rawData.filter(data => moment(data.updated_at).isBetween(moment().subtract(1, 'year'), moment()));
            break;
        case 'all':
            filteredData = rawData.filter(data => moment(data.updated_at).isBefore(moment()));
            break;
        default:
            filteredData = rawData;
    }
    console.log(filteredData)
    const newChartData = {
        labels: filteredData.map(data =>
            moment(data.updated_at).format('YYYY MMM DD')),
        datasets: [
            {
                label: 'BTC',
                backgroundColor: "#758cff",
                borderColor: "#758cff",
                data: filteredData.map(data => data.rate)
            }
        ]
    };

    chartData.value = newChartData;
};

const chartData = ref({
    labels: [] as string[],
    datasets: [
        {
            label: 'BTC',
            backgroundColor: '#758cff',
            borderColor: "#758cff",
            data: [] as number[],
        }
    ]
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1 / 2,
    showScale: false,
    pointRadius: 3,
    lineTension: 0.1,
    scales: {
        x: {
            grid: {
                display: false
            }
        },
    }
});

const loadChartData = async () => {
    const newData = JSON.parse(JSON.stringify(data.value))
    const rawData = [...newData];
    if (rawData && Array.isArray(rawData)) {
        chartData.value.labels = rawData.map((p) => {
            return moment(p.updated_at).format('YYYY MMM DD');
        });
        chartData.value.datasets[0].data = rawData.map(p => p.rate);
        isDataLoaded.value = true;
    }
};

loadChartData();
</script>

<template>
    <div>
        <Line v-if="isDataLoaded" :data="chartData" :options="chartOptions" />
        <div v-else>Loading...</div>
    </div>

    <flat-pickr v-model="startDate" :config="config" class="form-control" placeholder="Select date" />
    <flat-pickr v-model="endDate" :config="config" class="form-control" placeholder="Select date" />

    <select v-model="timePeriod">
        <option value="day">День</option>
        <option value="week">Неделя</option>
        <option value="month">Месяц</option>
        <option value="year">Год</option>
        <option value="all">За все время</option>
    </select>
</template>
