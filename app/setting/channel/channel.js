/**
 * 设置-渠道管理
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'Req', 'Common', 'DPTree'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element,
        DPTree = layui.DPTree;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;

    var parkList = [];      // 园区

    function loadData(url) {
        Req.getReq(url, function(res) {
            if(res.status) {
                parkList = res.data.data;
            }
        });
    }

    function init() {
        loadData($('#deptparkListAjaxUrl').val());
    }

    function renderRangeHtml(didArr, didTextArr, dtypeArr) {
        var _html = '';
        didTextArr.forEach(function(v, k) {
            if(dtypeArr && dtypeArr.length) {
                _html += '<span class="label-box mt-2 mr-5 mb-2">'+ v +'<i class="layui-icon layui-unselect ico-close ico-close-range" data-id="'+ didArr[k] +'" data-depttype="'+ dtypeArr[k] +'">ဆ</i></span>';
            } else {
                _html += '<span class="label-box mt-2 mr-5 mb-2">'+ v +'<i class="layui-icon layui-unselect ico-close ico-close-range" data-id="'+ didArr[k] +'">ဆ</i></span>';
            }

        });
        return _html;
    }

    $(function() {
        init();
        // 选择园区范围
        $(document).on('click', '.selectParkRange', function() {
            var $serviceRange = $('input[name=servicerange]'),
                $rangeDetail = $('.rangeDetail');
            if(parkList && parkList.length) {
                if (!$serviceRange.val()) {
                    // 未添加过
                    DPTree({
                        title: '选择园区范围',
                        searchPlaceHolder: '搜索部门或园区',
                        data: parkList,
                        callback: function (instance) {
                            $rangeDetail.html(renderRangeHtml(instance.didArr, instance.didTextArr, instance.dtypeArr));
                            $serviceRange.val(instance.didArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        showOther: false
                    });
                } else {
                    // 已添加过且再次添加，需要回填值
                    DPTree({
                        title: '选择园区范围',
                        searchPlaceHolder: '搜索部门或园区',
                        data: parkList,
                        callback: function (instance) {
                            $rangeDetail.html(renderRangeHtml(instance.didArr, instance.didTextArr, instance.dtypeArr));
                            $serviceRange.val(instance.didArr.join(','));
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        edit: $serviceRange.val().split(','),
                        showOther: false
                    });
                }
            }
        });

        $(document).on('click', '.rangeDetail .ico-close-range', function() {
            var $o = $(this),
                arr = [],
                _id = $o.attr('data-id');
            var $serviceRange = $('input[name=servicerange]');

            arr = $serviceRange.val().split(',');

            $o.parent().remove();

            var index = arr.indexOf(_id);
            arr.splice(index, 1);
            $serviceRange.val(arr.join(','));
        });

        form.on('submit', function (data) {
            var elem = data.elem,
                url = $(elem).attr('data-url');
            var $form = $('form'),
                param = $form.serializeArray();
            var result = [];

            if(!$('input[name=servicerange]').val()) {
                Dialog.errorDialog("请选择园区范围");
                return false;
            }

            var $ranges = $('.rangeDetail').find('.ico-close-range');
            $ranges.each(function (i, o) {
                var instance = {};
                var type = $(o).attr('data-depttype');
                if(type == '1') {
                    instance.regionType = 'dept';
                } else if(type == '2') {
                    instance.regionType = 'park';
                }
                instance.targetId = $(o).attr('data-id');
                result.push(instance);
            });

            param.push({name: 'regionsReqs', value: JSON.stringify(result)});

            Req.postReqCommon(url, param);

            return false;
        });
    });
});