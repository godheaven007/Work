/**
 * 首页-图表
 */
layui.define(function (exports) {
    var $ = layui.jquery;

    function getInterval(min, max, intervalNum) {
        var total = max - min,
            interval = total / intervalNum;

        if(interval < 100) {
            return Math.ceil(interval / 10) * 10;
        } else {
            return Math.ceil(interval / 100) * 100;
        }
    }

    // 设置最大最小值
    function setMinMaxValue(num, interval) {
        if(num >= 0) {
            return Math.ceil(num / interval) * interval;
        } else {
            return Math.floor(num / interval) * interval;
        }
    }

    // 柱状图+折线图
    function getUnionOption(list) {
        var colors = ['#80b3dd', '#ffb26d', '#aaaaaa'];
        var monthList = [],
            invest = [],            // 招商
            refund = [],            // 退租
            clean = [];             // 净招商
        if(list && list.length) {
            list.forEach(function (item, index) {
                monthList.push(item.statDay);
                invest.push(item.investArea);
                refund.push(item.refundArea);
                clean.push(item.cleanArea);
            });
        }
        // test
        // invest[0] = 12;
        // refund[0] = 23;
        // refund[11] = 50;
        // clean[0] = 17;
        var concat = invest.concat(refund).concat(clean);
        concat.sort(function (a, b) {
            return a - b;
        });

        var intervalNum = 5,
            min = concat[0],
            max = concat[concat.length - 1];

        var interval = getInterval(min, max, intervalNum);

        min = setMinMaxValue(min, interval);
        max = setMinMaxValue(max, interval);

        var splitNumber = (max - min) / interval;

        return {
            color: colors,
            title: [
                {
                    text: '近1年招商退租趋势图（单位：㎡）',
                    top: 'top',
                    left: 'center',
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 18
                    }
                }
            ],
            grid: {
                left: '5%',
                right: '5%'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (param, ticket, callback) {
                    var curIndex = param[0].dataIndex;
                    return  '<p>'+ monthList[curIndex] +'</p>' +
                        '<p>招商：'+ (!invest[curIndex] ? '-' : invest[curIndex]) +'㎡</p>' +
                        '<p>退租：'+ (!refund[curIndex] ? '-' : refund[curIndex]) +'㎡</p>' +
                        '<p>净招商：'+ (!clean[curIndex] ? '-' : clean[curIndex]) +'㎡</p>';
                },
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            legend: {
                top: '25',
                data:['招商','退租','净招商']
            },
            xAxis: [
                {
                    type: 'category',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#aaa'
                        }
                    },
                    data: monthList
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    interval: interval,
                    min: min,
                    max: max,
                    splitNumber: splitNumber,
                    // min: concat[0],
                    // max: concat[concat.length - 1],
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#aaa'
                        }
                    }
                },
                {
                    type: 'value',

                    interval: interval,
                    min: min,
                    max: max,
                    splitNumber: splitNumber,
                    // min: concat[0],
                    // max: concat[concat.length - 1],


                    axisLine: {show: false},
                    axisTick: {show: false},
                    axisLabel: {show: false}
                },
                {
                    type: 'value',

                    interval: interval,
                    min: min,
                    max: max,
                    splitNumber: splitNumber,
                    // min: concat[0],
                    // max: concat[concat.length - 1],

                    axisLine: {show: false},
                    axisTick: {show: false},
                    axisLabel: {show: false}
                }
            ],
            series: [
                {
                    name:'招商',
                    type:'bar',
                    barGap: '0%',
                    data: invest
                },
                {
                    name:'退租',
                    type:'bar',
                    barGap: '0%',
                    yAxisIndex: 1,
                    data: refund
                },
                {
                    name:'净招商',
                    type:'line',
                    yAxisIndex: 2,
                    data: clean
                }
            ]
        };
    }

    // 柱状图
    function getBarOption(param) {
        var monthList = [],
            incomeNative = [],      // 原始数据
            income = [];            // 回款(年展示)
        if(param.list && param.list.length) {
            param.list.forEach(function (item, index) {
                monthList.push(item.statMonth);
                incomeNative.push(item.sumBack);

                if(item.sumBack) {
                    income.push((parseFloat(item.sumBack) /10000).toFixed(1));
                } else {
                    income.push(item.sumBack)
                }
            });
        }

        return {
            title: {
                text: param.title,
                // subtext: param.subTitle,
                // subtextStyle: {
                //     fontSize: 14
                // },
                top: 'top',
                left: 'center',
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: 18
                }
            },
            grid: {
                left: '5%',
                right: '5%'
            },
            color: ['#80b3dd'],
            tooltip: {
                // formatter: '{b}<br>回款{c}万',
                formatter: function (param, ticket, callback) {
                    var curIndex = param.dataIndex;
                    var showIncomeStr = '';

                    if(!income[curIndex]) {
                        showIncomeStr = '-';
                    } else {
                        // showIncome = parseFloat(incomeNative[curIndex]) / 10000;
                        // if(showIncome > 1) {
                        //     showIncomeStr = showIncome.toFixed(1) + ' 万';
                        // } else {
                        //     showIncomeStr = incomeNative[curIndex] + ' 元';
                        // }
                        showIncomeStr = incomeNative[curIndex] + ' 元';
                    }
                    return  '<p>'+ param.name +' 回款</p>' +
                            '<p>'+ showIncomeStr +'</p>';
                },
            },
            grid: {
                show: false
            },
            xAxis: {
                data: monthList,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#aaa'
                    }
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                // name: '(单位：万)',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#aaa'
                    }
                },
                splitLine: {
                    show: true
                }
            },
            series: [{
                type: 'bar',
                barCategoryGap: '50%',
                label: {
                    show: true,
                    position: 'top',
                    textStyle: {
                        color: '#999'
                    },
                    formatter: '{c}万'
                },
                data: income
            }]
        };
    }

    // 折线图
    function getLineOption(list) {
        var monthList = [],
            sumArea = [],               // 总面积
            rentArea = [],              // 已租面积
            statDate = [],              // 时间
            rentalRate = [];            // 出租率
        if(list && list.length) {
            list.forEach(function (item, index) {
                monthList.push(item.statDay);
                sumArea.push(item.sumArea);
                rentArea.push(item.rentArea);
                statDate.push(item.statDateStr);
                rentalRate.push(item.rentalRate);
            });
        }
        // test
        // rentalRate[0] = 10;
        // rentalRate[1] = 20;
        // rentalRate[5] = 90;
        // rentalRate[7] = 35;
        return {
            title: [
                {
                    text: '近1年出租率趋势图',
                    top: 'top',
                    left: 'center',
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 18
                    }
                }
            ],
            color: ['#80b3dd'],
            grid: {
                left: '5%',
                right: '5%'
            },
            tooltip: {
                formatter: function (param, ticket, callback) {
                    var curIndex = param.dataIndex;
                    return  '<p>'+ (!statDate[curIndex] ? '-' : statDate[curIndex]) +'</p>' +
                        '<p>总面积：'+ (!sumArea[curIndex] ? '-' : sumArea[curIndex]) +'㎡</p>' +
                        '<p>已租：'+ (!rentArea[curIndex] ? '-' : rentArea[curIndex]) +'㎡</p>' +
                        '<p>出租率：'+ (!rentalRate[curIndex] ? '-' : rentalRate[curIndex]) +'%</p>';
                },
            },
            xAxis: {
                type: 'category',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#aaa'
                    }
                },
                data: monthList
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#aaa'
                    }
                },
                axisLabel: {
                    formatter: '{value}%'
                }
            },
            series: [{
                type: 'line',
                label: {
                    show: true,
                    position: 'top',
                    textStyle: {
                        color: '#999'
                    },
                    formatter: '{c}%'
                },
                data: rentalRate
            }]
        };

    }

    // 计租率时间范围(当年的1月1号至本月的最后一天)
    function getRangeDate(statDay) {
        if(!statDay) return statDay;

        var date = statDay.split('-'),
            year = date[0],
            month = date[1];
        var curMonthDate = new Date(year, parseInt(month), 0);
        return year + '-01-01~' + statDay + '-' + curMonthDate.getDate();
    }

    // 计租率
    function getLineOption2(list) {
        var monthList = [],
            statDate = [],                  // 时间
            recordRentRate = [];            // 计租率
        if(list && list.length) {
            list.forEach(function (item, index) {
                monthList.push(item.statDay);
                statDate.push(getRangeDate(item.statDay));
                recordRentRate.push(item.recordRentRate);
            });
        }
        // test
        // recordRentRate[0] = 10;
        // recordRentRate[1] = 20;
        // recordRentRate[5] = 90;
        // recordRentRate[7] = 35;
        // recordRentRate[10] = 65;
        return {
            title: [
                {
                    text: '近1年计租率趋势图',
                    top: 'top',
                    left: 'center',
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 18
                    }
                }
            ],
            color: ['#80b3dd'],
            grid: {
                left: '5%',
                right: '5%'
            },
            tooltip: {
                formatter: function (param, ticket, callback) {
                    var curIndex = param.dataIndex;
                    return  '<p>'+ (!statDate[curIndex] ? '-' : statDate[curIndex]) +'</p>' +
                        '<p>计租率：'+ (!recordRentRate[curIndex] ? '-' : recordRentRate[curIndex]) +'%</p>';
                },
            },
            xAxis: {
                type: 'category',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#aaa'
                    }
                },
                data: monthList
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#aaa'
                    }
                },
                axisLabel: {
                    formatter: '{value}%'
                }
            },
            series: [{
                type: 'line',
                label: {
                    show: true,
                    position: 'top',
                    textStyle: {
                        color: '#999'
                    },
                    formatter: '{c}%'
                },
                data: recordRentRate
            }]
        };

    }

    var Graph = {
        getUnionOption: getUnionOption,
        getBarOption: getBarOption,
        getLineOption: getLineOption,
        getLineOption2: getLineOption2
    };

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Graph', Graph);
});