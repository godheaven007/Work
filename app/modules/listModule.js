/**
 * 通用列表模块
 */

layui.define(function (exports) {
    var $ = layui.jquery,
        laydate = layui.laydate,
        form = layui.form,
        element = layui.element;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Dialog = layui.Dialog;

    function renderSearchDate() {
        var $dateBox = $('.datebox');
        $dateBox.each(function (i, o) {
            laydate.render({
                elem: $(o)[0],
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now']
            });
        });
    }

    // 监听提交
    form.on('submit', function(data){
        return false;
    });

    // 获取分页参数
    // function getSplitParam() {
    //     var $beginDate = $('input[name=begindate]'),
    //         $endDate = $('input[name=enddate]');
    //
    //     if($beginDate.val() && $endDate.val()) {
    //         if(!Common.Util.compareDate($beginDate.val(), $endDate.val())) {
    //             Dialog.errorDialog("开始日期不得大于结束日期");
    //             return false;
    //         }
    //     }
    // }

    function getSplitParam() {
        var param = {
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };

        var $inputs = $('.ajaxSearchForm input[type=text]');
        $inputs.each(function (i, o) {
            var $o = $(o),
                name = $o.attr('name');
            if(name) {
                // 不包括layui自动生成的无name属性的input[type=text]
                param[name] = $o.val()
            }
        });

        var $selects = $('.ajaxSearchForm select');
        $selects.each(function(i, o) {
            var $o = $(o),
                name = $o.attr('name');
            param[name] = $('select[name='+ name +'] option:selected').val();
        });

        var $checkboxes = $('.ajaxSearchForm input[type=checkbox]');
        $checkboxes.each(function (i, o) {
            var $o = $(o),
                name = $o.attr('name');
            if($o.prop('checked')) {
                param[name] = $o.val();
            } else {
                param[name] = '';
            }
        });

        // 排序
        var $activeOrder = $('.tableOrder .layui-edge.active');
        if($activeOrder.length) {
            var name = $activeOrder.parent().attr('data-name'),
                order = $activeOrder.attr('data-order');
            param[name] = order;
        }

        // 日期验证
        var $dateGroups = $('.ajaxSearchForm .dateGroup'),
            dateGroupLen = $dateGroups.length;
        if(dateGroupLen) {
            for(var i = 0; i < dateGroupLen; i++) {
                var $curDateGroup = $dateGroups.eq(i),
                    $beginDate = $curDateGroup.find('.datebox').eq(0),
                    $endDate = $curDateGroup.find('.datebox').eq(1);

                    if($beginDate.val() && $endDate.val()) {
                        if(!Common.Util.compareDate($beginDate.val(), $endDate.val())) {
                            Dialog.errorDialog("开始时间不能晚于结束时间");
                            return false;
                        }
                    }
            }
        }

        return param;
    }

    function eventHandle(cb) {
        // 搜索
        $(document).on('click', '.ajaxSearch', function(e) {
            // 日期输入格式错误时，防止取到无效的日期值
            setTimeout(function() {
                var param  = getSplitParam();
                if(param) {
                    if(cb) {
                        Pager.renderPager(param, cb);
                    } else {
                        Pager.renderPager(param);
                    }
                }
            },10);
        });

        $(document).keydown(function(event){
            if(event.keyCode==13){
                $('.ajaxSearch').trigger('click');
            }
        });

        // 排序
        $(document).on('click', '.tableOrder .layui-edge', function() {
            var $o = $(this),
                order = $o.attr('data-order');
            $('.tableOrder .layui-edge').removeClass('active');
            $o.addClass('active');

            if(order == '2') {
                // 升序
                $('.tableOrder').attr('lay-sort', '');
                $o.parent().attr('lay-sort', 'asc');
            } else if(order == '1') {
                // 降序
                $('.tableOrder').attr('lay-sort', '');
                $o.parent().attr('lay-sort', 'desc');
            }

            if($('.ajaxSearch').length) {
                $('.ajaxSearch').trigger('click');
            } else {
                // 园区介绍列表
                var param = getSplitParam();
                if(param) {
                    Pager.renderPager(param);
                }
            }
        });

        /**
         * 不存在搜索按钮（譬如只有下拉框没有搜索按钮，但选定时，直接触发搜索请求）
         */

        if($('.ajaxSearch').length) {
            // checkbox todo...

            // select   todo...
        }
    }

    // 当前列表页进行添加、删除等操作时，更新列表
    function updateList(cb) {
        var param = getSplitParam();
        if(param) {
            if(cb) {
                Pager.renderPager(param, cb);
            } else {
                Pager.renderPager(param);
            }
        }
    }

    function init(cb) {
        if($('.datebox').length) {
            renderSearchDate();
        }

        var pageAjaxUrl = $('#pageAjaxUrl').val();

        var pageParam = {
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
        };
        if(cb) {
            pageParam.renderForm = cb;
        }
        Pager.initPager(pageParam);

        eventHandle(cb);
    }

    var ListModule = {
        init: init,
        getSplitParam: getSplitParam,
        updateList: updateList
    }

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('ListModule', ListModule);
});