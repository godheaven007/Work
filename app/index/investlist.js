layui.use(['element', 'form', 'Dialog', 'Req', 'Common'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;

    $(function () {
        // 排序
        $(document).on('click', '.tableOrder .layui-edge', function() {
            var $o = $(this),
                order = $o.attr('data-order'),
                url = $o.attr('data-url');

            $('.tableOrder').attr('lay-sort', '');

            if(order == '2') {
                // 升序
                $o.parent().attr('lay-sort', 'asc');
            } else if(order == '1') {
                // 降序
                $o.parent().attr('lay-sort', 'desc');
            }

            Req.getReq(url, function (res) {
                $('.ajaxTableTbody').html(res.data.rentalratelistContent);
            });
        });

        $(document).on('click', '.ajaxTableTbody tr', function () {
            var url = $(this).attr('data-url');
            window.location.href = url;
        })
    });
});