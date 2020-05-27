/**
 * 工作台-招商看板
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager2', 'Regex','upload', 'MUpload', 'Graph'], function() {
    var $ = layui.jquery,
        form = layui.form,
        Pager2 = layui.Pager2,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var Graph = layui.Graph;

    function renderGraph(_id, list) {
        // 基于准备好的dom，初始化echarts实例
        var barChart = echarts.init(document.getElementById('refundData' + _id));
        // 使用刚指定的配置项和数据显示图表。
        barChart.setOption(Graph.getUnionOption(list));

        var lineChart = echarts.init(document.getElementById('rentData' + _id));
        lineChart.setOption(Graph.getLineOption(list));

        var lineChart2 = echarts.init(document.getElementById('rentalrateData' + _id));
        lineChart2.setOption(Graph.getLineOption2(list));
    }
    function init() {
        var $dds = $('.ranking dd');
        $dds.each(function (i, o) {
            var $o = $(o),
                curDeptId = $o.find('input[name=deptId]').val(),
                $curV = $o.find('#data' + curDeptId);
            var list = JSON.parse($curV.val());
            renderGraph(curDeptId, list);
        });
    }

    $(function() {
        init();
    });
});