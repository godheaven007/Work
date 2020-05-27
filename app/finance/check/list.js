/**
 * 财务-校核-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;


    function init() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        Pager.initPager({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
            // renderForm: function() {
            //     $('#selectAll').prop('checked', false);
            //     form.render();
            // }
        });
    }

    // 获取分页参数
    function getSplitParam() {
        var param = {
            type: $('select[name=type] option:selected').val(),
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        return param;
    }


    $(function() {

        init();

        /**
         * 搜索
         */
        $(document).on('click', '.ajaxSearch', function() {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });

        form.on('select(type)', function (data) {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });

        // form.on('checkbox(layTableAllChoose)', function (data) {
        //     var $boxes = $('.selectcheckbox');
        //
        //     var status = data.elem.checked;
        //     if(status) {
        //         $boxes.prop('checked', true);
        //     } else {
        //         $boxes.prop('checked', false);
        //     }
        //     form.render();
        // });
        // form.on('checkbox(layTableChoose)', function (data) {
        //     var allSize = $('.selectcheckbox').length,
        //         selectedSize = $('.selectcheckbox:checked').length;
        //
        //     if(selectedSize == allSize) {
        //         $('#selectAll').prop('checked', true);
        //     } else {
        //         $('#selectAll').prop('checked', false);
        //     }
        //     form.render();
        // })
    });
});