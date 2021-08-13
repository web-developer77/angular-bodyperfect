import { Component, Input, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartDataset, ChartOptions, ScriptableLineSegmentContext } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'hammerjs';
import * as _ from 'lodash';
import { ConstraintEnum, Customer } from 'src/types/Customer';
Chart.register(zoomPlugin);
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit {
  @Input() customer: Customer;

  lineChartData: ChartDataset[] = [
    {
      data: [],
      label: 'Weight',
      backgroundColor: 'rgba(255,255,0,0.25)',
      segment: {
        borderColor: (ctx) => this.colorSegmentFunction(ctx, 0, 'gray', 'transparent'),
        borderDash: (ctx) => this.borderDashSegmentFunction(ctx, 0, [6, 6]),
        backgroundColor: (ctx) => this.colorSegmentFunction(ctx, 0, undefined, 'transparent'),
      },
    },
    {
      data: [],
      label: 'Sleep',
      backgroundColor: 'rgba(0, 255, 200, 0.25)',
      segment: {
        borderColor: (ctx) => this.colorSegmentFunction(ctx, 1, 'gray', 'transparent'),
        borderDash: (ctx) => this.borderDashSegmentFunction(ctx, 1, [6, 6]),
        backgroundColor: (ctx) => this.colorSegmentFunction(ctx, 1, undefined, 'transparent'),
      },
    },
  ];

  lineChartLabels: string[] = [];

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
    spanGaps: true,
    interaction: {
      intersect: false,
    },
    elements: {
      line: { fill: true, borderColor: 'black' },
    },

    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          pinch: { enabled: true },
          wheel: { enabled: true, speed: 0.5 },
          mode: 'x',
        },
      },
    },
  };

  lineChartLegend = true;
  lineChartPlugins: any[] = [zoomPlugin];
  lineChartType = 'line';

  borderDashSegmentFunction(ctx: ScriptableLineSegmentContext, index: number, dashValue: number[]) {
    const value1 = this.lineChartData[index].data[ctx.p0DataIndex];
    const value2 = this.lineChartData[index].data[ctx.p1DataIndex];
    return value1 === null || value2 === null ? dashValue : undefined;
  }

  // If question was asked then value is null, if it wasn't asked on that day then it is undefined
  colorSegmentFunction(
    ctx: ScriptableLineSegmentContext,
    index: number,
    nullValueColor: string | undefined,
    undefinedValueColor: string | undefined
  ) {
    const value1 = this.lineChartData[index].data[ctx.p0DataIndex];
    const value2 = this.lineChartData[index].data[ctx.p1DataIndex];
    if (value1 === undefined || value2 === undefined) {
      return undefinedValueColor;
    }
    if (value1 === null || value2 === null) {
      return nullValueColor;
    }
    return undefined;
  }

  getDatesArray(start: Date, end: Date) {
    for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt));
    }
    return arr;
  }

  sameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  constructor() {}

  ngOnInit(): void {
    const questions = this.customer.question;
    let sleepQuestions = questions.filter((q) => q.constraint === ConstraintEnum.IsSleep);
    let weightQuestions = questions.filter((q) => q.constraint === ConstraintEnum.IsWeight);
    let labelArray: Date[] = [];

    if (sleepQuestions.length === 0 && weightQuestions.length !== 0) {
      labelArray = this.getDatesArray(new Date(weightQuestions[0].createdAt), new Date());
    } else if (sleepQuestions.length !== 0 && weightQuestions.length === 0) {
      labelArray = this.getDatesArray(new Date(sleepQuestions[0].createdAt), new Date());
    } else if (sleepQuestions.length !== 0 && weightQuestions.length !== 0) {
      const firstWeightDate = new Date(weightQuestions[0].createdAt);
      const firstSleepDate = new Date(sleepQuestions[0].createdAt);
      firstWeightDate > firstSleepDate
        ? (labelArray = this.getDatesArray(firstSleepDate, new Date()))
        : firstWeightDate < firstSleepDate
        ? (labelArray = this.getDatesArray(firstWeightDate, new Date()))
        : (labelArray = this.getDatesArray(firstWeightDate, new Date()));
    }
    this.lineChartLabels = labelArray.map((d) => d.toLocaleDateString().split('T')[0].replace(/-/g, '/'));

    const weightData = new Array(this.lineChartLabels.length).fill(undefined);
    weightQuestions.forEach((q) => {
      const index = labelArray.findIndex((date) => this.sameDay(new Date(q.createdAt), date));
      q.answer === null ? (weightData[index] = null) : (weightData[index] = Number(q.answer));
    });

    const sleepData = new Array(this.lineChartLabels.length).fill(undefined);
    sleepQuestions.forEach((q) => {
      const index = labelArray.findIndex((date) => this.sameDay(new Date(q.createdAt), date));
      q.answer === null ? (sleepData[index] = null) : (sleepData[index] = Number(q.answer));
    });

    this.lineChartData.find((dataObject) => dataObject.label.toLowerCase() === 'weight').data = weightData;
    this.lineChartData.find((dataObject) => dataObject.label.toLowerCase() === 'sleep').data = sleepData;
  }
}
