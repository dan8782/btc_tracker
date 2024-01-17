<script setup lang="ts">

import { ref } from 'vue'
import { Line } from 'vue-chartjs'
import flatPickr from 'vue-flatpickr-component';
import moment from 'moment';
import 'flatpickr/dist/flatpickr.css';
import 'chart.js/auto'

/**
 * конфиг для кастомного календаря ( верстка )
 */
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

const startDate = ref(moment().subtract(1, 'month').format('YYYY-MM-DD'));
const endDate = ref(moment().format('YYYY-MM-DD'));

// кастом выбор даты
watch([startDate, endDate], () => {
    isDataLoaded.value = false;
    updateCustom();
    isDataLoaded.value = true;
});

// сортировка
watch(timePeriod, () => {
    isDataLoaded.value = false;
    updateChartData();
    isDataLoaded.value = true;
});

const updateCustom = () => {
    let filteredData:any = [];

    const newData = JSON.parse(JSON.stringify(data.value))
    const rawData = [...newData];
    filteredData = rawData.filter(dataItem => {
        const dataDate = moment(dataItem.updated_at);
        return dataDate.isSameOrAfter(moment(startDate.value)) && dataDate.isSameOrBefore(moment(endDate.value));
    });

    filteredData = groupByDay(filteredData);

    const newChartData = {
        labels: filteredData.map((dataItem: { updated_at: moment.MomentInput; }) =>
            moment(dataItem.updated_at).format('YYYY MMM DD')),
        datasets: [
            {
                label: 'BTC',
                backgroundColor: '#758cff',
                borderColor: "#758cff",
                data: filteredData.map((dataItem: { rate: any; }) => dataItem.rate)
            }
        ]
    };

    chartData.value = newChartData;
};

const updateChartData = () => {
    let filteredData:any;
    const newData = JSON.parse(JSON.stringify(data.value))
    const rawData = [...newData];
    let formatString = 'YYYY MMM DD';
    switch (timePeriod.value) {
        case 'day':
            filteredData = rawData.filter(data => moment(data.updated_at).isBetween(moment().subtract(1, 'days'), moment()));
            formatString = 'HH:mm'
            break;
        case 'week':
            filteredData = rawData.filter(data => moment(data.updated_at).isBetween(moment().subtract(8, 'days'), moment()));
            filteredData = groupByDay(filteredData);
            break;
        case 'month':
            filteredData = rawData.filter(data => moment(data.updated_at).isBetween(moment().subtract(1, 'month'), moment()));
            filteredData = groupByDay(filteredData);
            break;
        case 'year':
            filteredData = rawData.filter(data => moment(data.updated_at).isBetween(moment().subtract(1, 'year'), moment()));
            filteredData = groupByDay(filteredData);
            break;
        case 'all':
            filteredData = rawData.filter(data => moment(data.updated_at).isBefore(moment()));
            filteredData = groupByDay(filteredData);
            break;
        default:
            filteredData = rawData;
    }

    const newChartData = {
        labels: filteredData.map((data: { updated_at: moment.MomentInput; }) =>
            moment(data.updated_at).format(formatString)),
        datasets: [
            {
                label: 'BTC',
                backgroundColor: "#758cff",
                borderColor: "#758cff",
                data: filteredData.map((data: { rate: any; }) => data.rate)
            }
        ]
    };

    chartData.value = newChartData;
};

/**
 * сортирует массив оставляя только дни
 */
function groupByDay(data: any[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    data.forEach(d => {
        const date = moment(d.updated_at).format('YYYY-MM-DD');
        if (!grouped[date]) {
            grouped[date] = d;
        }
    });
    return Object.values(grouped);
}

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
    aspectRatio: 1 / 1.5,
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
    let rawData:any = [...newData];
    rawData = groupByDay(rawData);
    if (rawData && Array.isArray(rawData)) {
        chartData.value.labels = rawData.map((p) => {
            return moment(p.updated_at).format('YYYY MMM DD');
        });
        chartData.value.datasets[0].data = rawData.map(p => p.rate);
        isDataLoaded.value = true;
    }
};

const countries = [{
  name: 'day',
  value: 'day'
}, {
  name: 'Week',
  value: 'week',
}, {
  name: 'Year',
  value: 'year'
}, {
  name: 'All Time',
  value: 'all',
}
]

loadChartData();
</script>

<template>
    <div class="chart-container">
        <Line v-if="isDataLoaded" :data="chartData" :options="chartOptions" />
        <div v-else class="loading-text">Loading...</div>
    </div>

    <div class="controls">
        <div class="custom">
            <div class="date-picker">
                <label for="start-date">Начало:</label>
                <flat-pickr id="start-date" v-model="startDate" :config="config" class="form-control"
                    placeholder="Select date" />
            </div>
            <div class="date-picker">
                <label for="end-date">Конец:</label>
                <flat-pickr id="end-date" v-model="endDate" :config="config" class="form-control"
                    placeholder="Select date" />
            </div>
        </div>

        <div class="select-box">
            <label for="time-period">Cортировка по</label>
            <USelectMenu v-model="timePeriod" :options="countries" option-attribute="name" id="time-period"/>
        </div>
    </div>
</template>
  
<style>
.chart-container {
    text-align: center;
}

.select-box {
    margin-left: 30px;
}

.controls {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-top: 20px;
    flex-wrap: wrap;
}

.custom {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
}

.date-picker {
    margin-bottom: 10px;
}

.form-control {
    width: 100%;
    max-width: 300px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    padding: 8px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
    margin: 5px;
}

label {
    font-weight: bold;
    margin-bottom: 5px;
    display: block;
    color: #333;
}

@media (max-width: 600px) {
    .controls {
        flex-direction: column;
    }
}
</style>
  

