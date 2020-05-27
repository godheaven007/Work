/**
 * 工作台-招商看板（园区）
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'Pager2', 'Regex', 'Graph', 'Nav'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        Pager2 = layui.Pager2,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Graph = layui.Graph;
    var Nav = layui.Nav;

    var pager = null,
        pager2 = null,
        pager3 = null;

    function renderSearchDate() {
        var $dateBox = $('.datebox');
        $dateBox.each(function (i, o) {
            laydate.render({
                elem: $(o)[0],
                trigger: 'click',
                // showBottom: false
                btns: ['clear', 'now']
            });
        });
    }

    // 获取分页参数
    function getSplitParam(index) {
        var param = {
            // keyword: $('input[name=keyword]').eq(index).val(),
            limit: $('.ajaxpageselect').eq(index).find('option:selected').val() || 10,
            page: $('.inputpage').eq(index).val() || 1
        };
        if($('input[name=keyword]').eq(index).length) {
            param.keyword = $('input[name=keyword]').eq(index).val();
        }
        param.contractBeginDate = $('input[name=contractBeginDate]').eq(index).val();
        param.contractEndDate = $('input[name=contractEndDate]').eq(index).val();

        return param;
    }

    function renderPage() {
        var pageAjaxUrl = $('#pageAjaxUrl').val(),
            pageAjaxUrl2 = $('#pageAjaxUrl2').val(),
            pageAjaxUrl3 = $('#pageAjaxUrl3').val();

        pager = Pager2({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam,
            pageContainer: $('.ajaxTableTbody'),
            pageBar: $('.ajaxTablePage').eq(0)
        });

        pager2 = Pager2({
            type: 1,
            url: pageAjaxUrl2,
            callback: getSplitParam,
            pageContainer: $('.ajaxTableTbody2'),
            pageBar: $('.ajaxTablePage').eq(1)
        });

        pager3 = Pager2({
            type: 1,
            url: pageAjaxUrl3,
            callback: getSplitParam,
            pageContainer: $('.ajaxTableTbody3'),
            pageBar: $('.ajaxTablePage').eq(2)
        });
    }

    function renderGraph(list) {
        // 趋势图
        var barChart = echarts.init(document.getElementById('refundparkData'));
        barChart.setOption(Graph.getUnionOption(list));

        // 出租率
        var lineChart = echarts.init(document.querySelector('.rentparkData'));
        lineChart.setOption(Graph.getLineOption(list));

        // 计租率
        var lineChart2 = echarts.init(document.querySelector('.rentalrateData'));
        lineChart2.setOption(Graph.getLineOption2(list));

    }
    function init() {
        var list = JSON.parse($('input[name=parkData]').val());
        renderGraph(list.statList);

        renderPage();
        renderSearchDate();
    }

    $(function() {
        init();

        /**
         * 搜索
         */
        $(document).on('click', '.ajaxSearch', function() {
            var $ajaxSearch = $('.ajaxSearch');
            var index = $ajaxSearch.index($(this));

            // 日期验证
            var $dateGroups = $('.dateGroup'),
                dateGroupLen = $dateGroups.length;
            if(dateGroupLen) {
                for(var i = 0; i < dateGroupLen; i++) {
                    var $curDateGroup = $dateGroups.eq(i),
                        $beginDate = $curDateGroup.find('.datebox').eq(0),
                        $endDate = $curDateGroup.find('.datebox').eq(1);

                    if($beginDate.val() && $endDate.val()) {
                        if(!Common.Util.compareDate($beginDate.val(), $endDate.val())) {
                            Dialog.errorDialog("开始时间不能晚于结束时间");
                            // return false;
                        }
                    }
                }
            }

            var param  = getSplitParam(index);
            if(index == 0) {
                // 招商明细
                pager.render(param);
            } else if(index == 1) {
                // 退租明细
                pager2.render(param);
            } else if(index == 2) {
                // 计租率明细
                pager3.render(param);
            }
        });

        $(document).on('keydown', 'input[name=keyword]', function(e) {
            var $keyword = $('input[name=keyword]'),
                index = $keyword.index($(this));

            if (e.keyCode == 13) {
                $('.ajaxSearch').eq(index).trigger('click');
            }
        });

        $(document).keydown(function(event){
            if(event.keyCode==13){
                $('.ajaxSearch').trigger('click');
            }
        });

        // 导出
        $(document).on('click', '.exportData', function (e) {
            e.preventDefault();
            var $exportData = $('.exportData'),
                index = $exportData.index($(this)),
                url = $(this).attr('data-url'),
                key = $(this).attr('data-key'),
                deptName = $(this).attr('data-dept-name');

            var param = getSplitParam(index);
            param.key = key;
            param.deptName = deptName;

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

        Nav({
            scrollArea: $('.workbench-box'),
            scrollBoxes: $('.scrollBox'),
            pageNavBar: $('.tab-fixed, .tab-index')
        })
    });
});