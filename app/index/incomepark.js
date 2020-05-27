/**
 * 工作台-收入看板(园区)
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'Regex', 'laydate', 'Graph', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        Pager = layui.Pager,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Graph = layui.Graph;
    var ListModule = layui.ListModule;

    var mode;
    var CURDATE = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');

    function init() {
        var pathName = location.pathname;

        if(pathName == '/index/incomedaypark') {
            mode = 'day';
            bindSelectDayEvent();
        } else if(pathName == '/index/incomemonthpark' || pathName == '/index/collectlist') {
            mode = 'month';
        } else if(pathName == '/index/incomeyearpark'){
            mode = 'year';
            if($('.graph').length) {
                renderGraphHandle();
            }
        }
        ListModule.init();
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
        // var param = {
        //     title: $('.curDate').text() + '回款'+ getTotalIncome(data) + '万',
        //     list: data
        // };
        var param = {
            title: $('.curDate').text() + '回款趋势',
            // subTitle: '(总计回款'+ getTotalIncome(data) +'万)',
            list: data
        };
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

    // 归属子科目
    function renderChildSub(list) {
        var _html = '<option value="">全部</option>';
        if(list && list.length) {
            list.forEach(function (item) {
                _html += '<option value="'+ item.subId +'">'+ item.subName +'</option>';
            })
        }
        $('select[name=childsubject]').html(_html);
        form.render();
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
        var newUrl = Common.Util.replaceUrlParam('day', $('.curDate').attr('data-date'));
        window.location.href = newUrl;
    }

    $(function() {
        init();

        // 前一年\前一月
        $(document).on('click', '.preYear', function () {
            var $o = $(this),
                date = $('.curDate').attr('data-date');
            if($o.hasClass('disabled')) {
                return false;
            }
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

        form.on('select(parentsubject)', function(data) {
            var url = $('input[name=selectthreesubject]').val();
            // url = url + '?id=' + data.value;

            url = '/index/getSubjectList?id=' + data.value;
            Req.getReq(url, function (res) {
                if(res.status) {
                    renderChildSub(res.data.threeSubjects);
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 导出
        $(document).on('click', '.exportData', function (e) {
            e.preventDefault();
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');
            var deptName = $(this).attr('data-dept-name'),
                date = $(this).attr('data-date');

            var param = ListModule.getSplitParam();
            param.key = key;
            if($('select[name=parentsubject]').length) {
                param.parentsubjectKey = $('select[name=parentsubject] option:selected').text() || '';
            }

            if($('select[name=childsubject]').length) {
                param.childsubjectKey = $('select[name=childsubject] option:selected').text() || '';
            }

            // 费用科目
            if($('select[name=type]').length) {
                param.typeKey = $('select[name=type] option:selected').text() || '';
            }

            param.deptName = deptName;
            param.date = date;


            Req.postReq(url, param, function (res) {
                if(res.status) {
                    Dialog.downloadDialog({
                        downloadUrl: res.data.url
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
    });
});