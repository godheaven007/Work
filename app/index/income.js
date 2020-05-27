/**
 * 工作台-收入看板
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager2', 'Regex','upload', 'laydate', 'Graph'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        Pager2 = layui.Pager2,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Graph = layui.Graph;

    var mode = 'month';
    var CURDATE = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');

    function init() {
        var pathName = location.pathname;

        if(pathName == '/index/incomeday') {
            mode = 'day';
            bindSelectDayEvent();
        } else if(pathName == '/index/incomeyear') {
            mode = 'year';
            if($('.graph').length) {
                renderGraphHandle();
            }
        }
    }

    // 计算总回款
    function getTotalIncome(list) {
        var sum = 0;
        list.forEach(function (item, index) {
           var curV = !item.sumBack ? 0 : parseFloat(item.sumBack);
           sum = Common.Util.accAdd(curV, sum);
        });

        return (sum / 10000).toFixed(1);
    }

    // 年-回款-柱状图
    function renderGraphHandle() {
        var data = JSON.parse($('input[name=back]').val());
        var param = {
            title: $('.curDate').text() + '回款趋势',
            // subTitle: '(总计回款'+ getTotalIncome(data) +'万)',
            list: data
        };
        // var arr = [
        //     {"sumBack":40296.16,"statMonth":"2020-01"},
        //     {"sumBack":5000,"statMonth":"2020-02"},
        //     {"sumBack":null,"statMonth":"2020-03"},
        //     {"sumBack":null,"statMonth":"2020-04"},
        //     {"sumBack":null,"statMonth":"2020-05"},
        //     {"sumBack":null,"statMonth":"2020-06"},
        //     {"sumBack":null,"statMonth":"2020-07"},
        //     {"sumBack":500,"statMonth":"2020-08"},
        //     {"sumBack":null,"statMonth":"2020-09"},
        //     {"sumBack":1200,"statMonth":"2020-10"},
        //     {"sumBack":null,"statMonth":"2020-11"},
        //     {"sumBack":null,"statMonth":"2020-12"}
        // ];
        // param.list = arr;
        renderGraph('refundData', param);
    }

    function renderGraph(_id, list) {
        // 基于准备好的dom，初始化echarts实例
        var barChart = echarts.init(document.getElementById(_id));
        // 使用刚指定的配置项和数据显示图表。
        barChart.setOption(Graph.getBarOption(list));
    }

    function bindSelectDayEvent() {
        laydate.render({
            elem: '.selectDay',
            trigger: 'click',
            // showBottom: false,
            btns: ['clear', 'now'],
            value: $('.curDate').attr('data-date'),
            done: function (data) {
                $('.selectDay').text('');
                $('.curDate').attr('data-date', data);
                renderContent();
            }
        });
        $('.selectDay').text('');
    }

    /**
     * @param dateStr YYYY-MM-DD
     * @returns {{year: number, month: number, day: number}}
     */
    function getDateInfo(dateStr) {
        var arr = dateStr.split('-');
        return {
            year: arr[0],
            month: arr[1],
            day: arr[2]
        }
    }

    /**
     * 下一年\下一月是否可点击
     * @param date
     */
    function handleDate(date) {
        $('.curDate').attr('data-date', date);

        if(mode == 'month') {
            var param = getDateInfo(date);
            $('.curDate').text(param.year + '年' + param.month + '月');
            var yearMonth = param.year + '-' + param.month;
            var compYearMonth = CURDATE.substr(0, 7);

            if(yearMonth == compYearMonth) {
                $('.nextYear').addClass('disabled');
            } else {
                $('.nextYear').removeClass('disabled');
            }
        }
        if(mode == 'year') {
            $('.curDate').text(date + '年');
            var compYear = CURDATE.substr(0, 4);
            if(date == compYear) {
                $('.nextYear').addClass('disabled');
            } else {
                $('.nextYear').removeClass('disabled');
            }
        }
    }

    function renderContent() {
        // var url = $('input[name=dataAjaxUrl]').val();
        // url += url + '?day=' + $('.curDate').attr('data-date');


        var url = Common.Util.replaceUrlParam('day', $('.curDate').attr('data-date'));
        window.location.href = url;

        // Req.getReq(url, function (res) {
        //     if(res.status) {
        //         $('.topContent').html(res.data.top);
        //         $('.bottomContent').html(res.data.bottom);
        //         if(mode == 'day') {
        //             bindSelectDayEvent();
        //         }
        //         if(mode == 'year') {
        //             $('.middleContent').html(res.data.middle);
        //             renderGraphHandle();
        //         }
        //     } else {
        //         Dialog.errorDialog(res.msg);
        //     }
        // })
    }

    $(function() {
        init();

        // 前一年\前一月
        $(document).on('click', '.preYear', function () {
            var $o = $(this),
                date = $('.curDate').attr('data-date');
            if(mode == 'year') {
                var year = parseInt(date) - 1;
                handleDate(year);
            } else if(mode == 'month') {
                handleDate(Common.Util.prevMonth(date));
            }
            renderContent();
        });
        // 后一年\后一月
        $(document).on('click', '.nextYear', function () {
            var $o = $(this),
                date = $('.curDate').attr('data-date');
            if($o.hasClass('disabled')) {
                return false;
            }
            if(mode == 'year') {
                var year = parseInt(date) + 1;
                handleDate(year);
            } else if(mode == 'month') {
                handleDate(Common.Util.nextMonth(date));
            }
            renderContent();
        });
    });
});