/**
 * 设置-企业微信通讯录API开启确认
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        element = layui.element,
        form = layui.form;
    var Common = layui.Common;
    var Dialog = layui.Dialog;
    var Req = layui.Req;


    function renderHtml(data) {
        var notMatchList = data.notMatchList,
            _html = '<p><i class="iconfont ibs-ico-success c-green mr-5"></i>已成功读取企业微信通讯录<br>' +
                '企业名称：' + data.deptName + '<br>' +
                '通讯录人数：' + data.userCount + '人' +
                '</p>' +
                '<p>本系统成员共' + data.empCount + '人，与企业微信通讯录成员自动匹配成功' + data.matchCount + '人（姓名和手机号码均相同则为匹配成功）。<br>' +
                '还有以下' + data.notMatchCount + '人未在企业微信通讯录中发现匹配成员，您可以后续在组织管理中再进行关联。' +
                '</p>';
        if(notMatchList && notMatchList.length) {
            _html +=
                '<table class="layui-table" style="width: 600px;">' +
                '<colgroup>' +
                '<col width="60">' +
                '<col>' +
                '</colgroup>' +
                '<thead>' +
                '<tr>' +
                '<th class="txt-c">序号</th>' +
                '<th class="txt-c">未匹配成员</th>' +
                '</tr> ' +
                '</thead>' +
                '<tbody>';
            notMatchList.forEach(function (item, index) {
                _html += '<tr>' +
                    '<td class="text-c">' + (parseInt(index) + 1) + '</td>' +
                    '<td class="pd-80">' + item.empName + '(' + item.empPhone + ')' + '</td>' +
                    '</tr>'
            });
            _html +=
                '</tbody>' +
                '</table>';
        }
        return _html;
    }

    function loadWebchatApi() {
        var url = $('input[name=matchEmpList]').val();
        Req.getReq(url, function(res) {
            if(res.status) {
                $('.waitContent').html(renderHtml(res.data.data));
                $('.buttons').show();
            }
        });
    }

    $(function() {
        loadWebchatApi();

        $(document).on('click', '#submit', function () {
           var url = $(this).attr('data-url'),
               $form = $('form');
           var data = $form.serializeArray();

            var layerIndex = layer.load(2, {shade: [0.1, '#000']});

            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: data
            })
                .done(function(res) {
                    if(res.status) {
                        Dialog.successDialog(res.msg);
                        if(res.data.url) {
                            window.location.href = res.data.url;
                        }
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                })
                .always(function() {
                    layer.close(layerIndex);
                });
        });
    });
});