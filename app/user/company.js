/**
 * 关联企业
 */
layui.use(['element', 'form', 'Dialog', 'Req'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

    var getRootDomain = function() {
        var host = "null",
            url,
            origin;
        if (typeof url == "undefined" || null == url)
            url = window.location.href;
        origin = url.split('?')[0];
        var regex = /.*\:\/\/([^\/|:]*).*/;
        var matchVal = origin.match(regex);
        if (typeof matchVal != "undefined" && null != matchVal) {
            host = matchVal[1];
        }
        if (typeof host != "undefined" && null != host) {
            var strAry = host.split(".");
            if (strAry.length > 1) {
                host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
            }
        }
        return host;
    };

    function renderInviteList(list) {
        var _html = '';

        if(list && list.length) {
            list.forEach(function (item, index) {
                _html += '<dd>' +
                            '<div class="txt">' +
                                '<span class="font-b" title="'+ item.corpLinkman +'">'+ item.corpLinkman +'</span>&ensp;邀请你加入&ensp;<span class="font-b" title="'+ item.corpName +'">'+ item.corpName +'</span>' +
                            '</div>' +
                            '<div class="box-right enterBack hidden">' +
                                '<a href="/index?corpUuid=' + item.uuId + '&enter=1" class="btn-normal">进入后台</a>' +
                            '</div>' +
                            '<div class="box-right resultTxt">' +
                                '<a href="javascript:;" class="btn-normal btn-agree ajaxAgree" data-url="/account/ajax_deal_refuse?id=' + item.empUuId + '&status=1">同意</a>' +
                                '<a href="javascript:;" class="btn-normal btn-refuse ajaxRefuse" data-url="/account/ajax_deal_refuse?id=' + item.empUuId + '&status=2">拒绝</a>' +
                            '</div>' +
                    '</dd>';
            });
            $('.inviteList').html(_html);
        }
    }

    $(function() {
        // 同意
        $(document).on('click', '.ajaxAgree', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                $dd = $o.parents('dd'),
                $resultTxt = $o.parent('.resultTxt'),
                $enterBack = $resultTxt.prev('.enterBack');

            var allEnterBackLen = $('.enterBack').length,
                $hiddenEnterBack = $('.enterBack.hidden'),
                activeEnterBackLen = allEnterBackLen - $hiddenEnterBack.length;

            Req.getReq(url, function (res) {
                if(res.status) {
                    // v1.6.4
                    if((activeEnterBackLen + 1) == allEnterBackLen) {
                        // 全部处理完，直接进入工作台
                        window.location.href = 'http://ibs.' + getRootDomain();
                    } else {
                        $enterBack.removeClass('hidden');
                        $resultTxt.addClass('hidden');
                    }
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 拒绝
        $(document).on('click', '.ajaxRefuse', function() {
            var $o = $(this),
                url = $o.attr('data-url');
            var $curDd = $o.parents('dd');
            var haveInviteUrl = $('#ajaxHaveInviteUrl').val();

            Dialog.confirmDialog({
                title: '拒绝企业邀请',
                content: '你确认要拒绝该企业的邀请吗？',
                yesFn: function(index, layero) {
                    var layerIndex = layer.load(2, {shade: [0.1, '#000']});

                    Req.getReq(url, function (res) {
                        if(res.status) {
                            $curDd.remove();
                            // layer.close(layerIndex);
                            layer.closeAll();
                            if(!$('.inviteList dd').length) {
                                // 拒绝所有企业后，判断当前用户是否已经加入企业
                                Req.getReq(haveInviteUrl, function (result) {
                                    if(result.status) {
                                        window.location.href = result.data.url;
                                    } else {
                                        renderInviteList(result.data.inviteCorpList);
                                    }
                                });
                            }
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                        layer.closeAll();
                    });
                }
            });
        });
    });
});
