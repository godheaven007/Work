/**
 * 设置-财务设置-收款银行
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'eleTree', 'Req', 'Common', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;

    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;
    var ListModule = layui.ListModule;


    function getParkListHtml(list) {
        var _html = '';
        list.forEach(function (item, index) {
           _html += '<div><input type="checkbox" name="parkId[]" value="'+ item.parkId +'" lay-skin="primary" title="'+ item.parkName +'"></div>';
        });
        return _html;
    }

    function renderParkList(_id) {
        var url = $('input[name=selectUrl]').val();
        url = url + '?id=' + _id;

        Req.getReq(url, function (res) {
            $('.projectCheckbox').html(getParkListHtml(res.data.list));
            form.render();
        });
        form.render();
    }

    function init() {
        ListModule.init();
    }

    $(function() {
        init();

        // 删除
        $(document).on('click', '.ajaxDelBank', function() {
            var url = $(this).attr('data-url');
            Dialog.delDialog({
                title: '温馨提醒',
                content: '<div style="padding: 20px;">删除后将不再显示，是否确定要删除？</div>',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            })
        });

        // 运营公司切换
        form.on('select(operateName)', function (data) {
            renderParkList(data.value);
        });

        form.on('submit(saveSubmit)', function (data) {
           var $form = $('form'),
               $elem = $(data.elem),
               url = $elem.attr('data-url'),
               param = $form.serializeArray();

           Req.postReqCommon(url, param);
           return false;
        });

        form.on('submit', function () {
            return false;
        })
    });
});