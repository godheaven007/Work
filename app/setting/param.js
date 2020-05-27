/**
 * 设置-参数设置
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'Req','Common', 'DPTree', 'Regex', 'upload', 'MUpload'], function() {
    var $ = layui.jquery,
        element = layui.element,
        form = layui.form;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;
    var DPTree = layui.DPTree;
    var Regex = layui.Regex;

    var parkRangeList = [];   // 分组小程序-园区范围

    form.on('submit', function(data) {
        return false;
    });

    function getFixedRentTxt(duration) {
        if(duration == 0.5) {
            return '半';
        }
        return duration;
    }

    function getWechatHtml(isOpen, corpId, corpSecret) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label">开启/关闭</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="radio" name="open" lay-filter="open" value="0" title="关闭">' +
                                    '<input type="radio" name="open" lay-filter="open" value="1" title="开启" checked>' +
                                '</div>' +
                            '</div>';
        if(isOpen == '0') {
            // 关闭
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label">企业ID</label>' +
                        '<div class="layui-input-block">' +
                            '<input type="text" name="corpId" value="'+ corpId +'" lay-reqText="请填写企业ID" required placeholder="请填写企业ID" autocomplete="off" readonly class="layui-input disabled" >'+
                        '</div>' +
                    '</div>'+
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label">通讯录Secret</label>' +
                        '<div class="layui-input-block">' +
                            '<input type="text" name="corpSecret" value="'+ corpSecret +'" lay-reqText="请填写通讯录Secret" required placeholder="请填写通讯录Secret" readonly autocomplete="off" class="layui-input disabled" >'+
                        '</div>' +
                    '</div>';
        } else {
            // 开启
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label">企业ID</label>' +
                        '<div class="layui-input-block">' +
                            '<input type="text" name="corpId" value="'+ corpId +'" lay-reqText="请填写企业ID" required placeholder="请填写企业ID" autocomplete="off" class="layui-input" >'+
                        '</div>' +
                    '</div>'+
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label">通讯录Secret</label>' +
                        '<div class="layui-input-block">' +
                            '<input type="text" name="corpSecret" value="'+ corpSecret +'" lay-reqText="请填写通讯录Secret" required placeholder="请填写通讯录Secret" autocomplete="off" class="layui-input" >'+
                        '</div>' +
                    '</div>';
        }
        _html +=            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getBottomPriceDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label">租金底价调整</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="radio" name="rent" value="1" title="需要审批">' +
                                    '<input type="radio" name="rent" value="0" title="不需要审批" checked>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label">租金表价调整</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="radio" name="rent2" value="1" title="需要审批">' +
                                    '<input type="radio" name="rent2" value="0" title="不需要审批" checked>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label">物业费底价调整</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="radio" name="property" value="1" title="需要审批">' +
                                    '<input type="radio" name="property" value="0" title="不需要审批" checked>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item" style="margin-bottom: 0;">' +
                                '<div class="layui-input-block" style="margin-left: 42px; color: #888;"><i class="iconfont ibs-ico-tips" style="color:#5FB878;"></i>以上设置对所有园区生效</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }


    // 水印
    function getWaterHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label">开启/关闭</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="radio" name="open" value="0" title="关闭">' +
                                    '<input type="radio" name="open" value="1" title="开启">'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 小程序设置别名
    function getAliasDialogHtml(alias) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-blockxxx">' +
                                    '<input type="text" name="alias" value="'+ alias +'" lay-verify="required" maxlength="8" lay-reqText="请输入别名" required placeholder="请输入别名" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getAppTitleDialogHtml(title) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-blockxxx">' +
                                    '<input type="text" name="homePageTitle" value="'+ title +'" lay-verify="required" lay-reqText="请填写小程序首页标题" required placeholder="请填写小程序首页标题" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getWeiXinAccountDialogHtml(account) {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="">' +
                '<div class="layui-form-item">' +
                    '<div class="layui-input-blockxxx">' +
                        '<input type="text" name="account" value="'+ account +'" lay-verify="required|digit10" maxlength="10" lay-reqText="请输入微信支付商户号" required placeholder="请输入微信支付商户号" autocomplete="off" class="layui-input" >'+
                    '</div>' +
                '</div>' +
                '<div class="layui-form-item">' +
                '<div class="layui-input-blockxxx" style="color:#888">请从微信商户平台（pay.weixin.qq.com）-->账户中心-->账户设置-->商户信息中获取</div>' +
                '</div>' +
                '<!--写一个隐藏的btn -->' +
                '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    function getWeiXinKeyDialogHtml(key) {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="">' +
                '<div class="layui-form-item">' +
                    '<div class="layui-input-blockxxx">' +
                        '<input type="text" name="name" value="'+ key +'" lay-verify="required|appletKey" lay-reqText="请输入API秘钥" maxlength="32" required placeholder="请将商户平台设置好的API秘钥粘贴到这里" autocomplete="off" class="layui-input" >'+
                    '</div>' +
                '</div>' +
                '<div class="layui-form-item">' +
                '<div class="layui-input-blockxxx" style="color:#888">请从微信商户平台（pay.weixin.qq.com）-->账户中心-->账户设置-->API安全中获取</div>' +
                '</div>' +
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    function getUploadCerDialogHtml(result) {
        var _html = '<div class="layui-card-body" style="height: 180px; overflow-y: scroll;">' +
                    '<form class="layui-form" action="">' +
                        '<div class="layui-form-item" style="margin-top: 20px;">' +
                            '<div class="layui-input-blockxxx">' +
                                '<div class="upload-wrapper">' +
                                    '<div class="upload-box">' +
                                        '<button type="button" class="layui-btn uploadCerBtn"><i class="layui-icon"></i>上传</button>' +
                                    '</div>' +
                                    '<div class="upload-list">';
                                    result.forEach(function (item, index) {
                                            _html += '<div class="upload-file-item">' +
                                                '<i class="file-icon '+ item.attFileType +'"></i>' +
                                                '<a class="upload-file-name" href="'+ item.attUrl +'" target="_blank">'+ item.attName +'</a>' +
                                                '<i class="upload-file-remove" data-id="'+ item.attFileId +'"></i>' +
                                                '<input type="hidden" name="fileId[]" value="'+ item.attFileId +'">' +
                                                '</div>';
                                        });
                                _html +=
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="layui-form-item">' +
                            '<div class="layui-input-blockxxx" style="color:#888">请从微信商户平台（pay.weixin.qq.com）-->账户中心-->账户设置-->API安全-->API证书获取</div>' +
                        '</div>' +
                    '<!--写一个隐藏的btn -->' +
                    '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                    '</button>' +
                    '</form>' +
            '</div>';
        return _html;
    }



    // 运营公司
    function getCompanyHtml(companyName) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">运营公司</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="name" value="'+ companyName +'" lay-verify="required"  lay-reqText="请输入运营公司全称" required placeholder="请输入运营公司全称" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                        '<!--写一个隐藏的btn -->' +
                        '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                        '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function addEditCompany(title, url, companyName) {
        Dialog.formDialog({
            title: title + '运营公司',
            content: getCompanyHtml(companyName),
            success: function(layero, index) {
                form.render();    // 表单渲染
                form.on('submit(bind)', function(data){
                    var layerIndex = layer.load(2, {shade: [0.1, '#000']});

                    $.ajax({
                        url: url,
                        type: 'POST',
                        dataType: 'json',
                        data: data.field
                    })
                        .done(function(res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg);
                                layer.close(index);
                                if(res.data.url) {
                                    Pager.renderPager(res.data.url);
                                }
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        })
                        .always(function() {
                            layer.close(layerIndex);
                        });
                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        });
    }

    // 获取分页参数
    function getSplitParam() {
        var param = {
            ordering: $('#pageOrderValue').val() || '',
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        return param;
    }

    function init() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();
        Pager.initPager({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
        });

        var $deptparkListAjaxUrl = $('#deptparkListAjaxUrl');
        if($deptparkListAjaxUrl.length) {
            Req.getReq($deptparkListAjaxUrl.val(), function (res) {
                if(res.status) {
                    parkRangeList = res.data.data;
                }
            })
        }
    }

    // 应收账审核模式
    function getAccountReceiveHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog" style="padding: 0 20px;">' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="mode" value="1" title="普通审核模式">' +
                                '</div>' +
                                '<div class="layui-input-block" style="margin-left: 0;">业务人员登记合同收费计划后，财务人员可看到并进行核对。发现问题可退回修改</div>'+
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="mode" value="2" title="双重验证模式">' +
                                '</div>' +
                                '<div class="layui-input-block" style="margin-left: 0;">业务人员登记合同收费计划后，财务人员校核时看不到业务人员登记的内容。财务人员需自己登记合同收费计划，当与业务人员登记内容一致时则校核通过。</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;"><i class="iconfont ibs-ico-tips" style="color:#5FB878;"></i>以上设置对所有园区生效</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 入驻前客户绑定
    function getOpenCustomerBindHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog" style="padding: 0 20px;">' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="mode" value="0" title="不需要先绑定小程序">' +
                                '</div>' +
                                '<div class="layui-input-block" style="margin-left: 0;">客户不用绑定小程序，也可以办理入驻</div>'+
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="mode" value="1" title="需要先绑定小程序">' +
                                '</div>' +
                                '<div class="layui-input-block" style="margin-left: 0;">需要客户先绑定小程序才可以办理入驻，这样可以确保入驻客户及时绑定小程序，从而后续能通过小程序接收账单并在线支付</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;"><i class="iconfont ibs-ico-tips" style="color:#5FB878;"></i>以上设置对所有园区生效</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 房源底价显示
    function getHousePriceDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog" style="padding: 0 20px;">' +
                        '<div class="layui-form-item">' +
                            '<div class="layui-input-block" style="margin-left: 0;">' +
                                '<input type="radio" name="mode" value="1" title="显示">' +
                            '</div>' +
                            '<div class="layui-input-block" style="margin-left: 0;">房源底价对园区招商和运营人员可见（即没有房源管理权限的人，可以在房源管理中看到底价）</div>'+
                        '</div>' +
                        '<div class="layui-form-item">' +
                            '<div class="layui-input-block" style="margin-left: 0;">' +
                                '<input type="radio" name="mode" value="0" title="隐藏">' +
                            '</div>' +
                            '<div class="layui-input-block" style="margin-left: 0;">仅拥有房源管理权限的人才可以看到底价</div>' +
                        '</div>' +
                        '<div class="layui-form-item">' +
                            '<div class="layui-input-block" style="margin-left: 0;"><i class="iconfont ibs-ico-tips" style="color:#5FB878;"></i>以上设置对所有园区生效</div>' +
                        '</div>' +
                        '<!--写一个隐藏的btn -->' +
                        '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                        '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 回款统计口径
    function getStatisticDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog" style="padding: 0 20px;">' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">假设某企业1月31日缴纳租金10万元，当天到账，2月1日财务发起对账，2月2日完成对账复核。</div>'+
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="statMode" value="1" title="按实际到账日期">' +
                                '</div>' +
                                '<div class="layui-input-block" style="margin-left: 0;">则这笔10万元归属为1月31日的回款</div>'+
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="statMode" value="2" title="按发起对账日期">' +
                                '</div>' +
                                '<div class="layui-input-block" style="margin-left: 0;">则这笔10万元归属为2月1日的回款</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;">' +
                                    '<input type="radio" name="statMode" value="3" title="按对账复核日期">' +
                                '</div>' +
                            '<div class="layui-input-block" style="margin-left: 0;">则这笔10万元归属为2月1日的回款</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;"><i class="iconfont ibs-ico-tips" style="color:#5FB878;"></i>更改后第2天生效，历史回款也将按新规则重新统计</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 客服电话(全局)
    function getPhoneDialogHtml(phone) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item" style="padding: 20px;">' +
                                '<div class="layui-input-block2">' +
                                    '<input type="text" name="phone" value="'+ phone +'" lay-verify="required|fixedPhone2" maxlength="12"  lay-reqText="请输入客服电话" required placeholder="请输入客服电话" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getAddEditDialogHtml(param) {
        var _html = '<div class="layui-card-body" style="height: 180px; overflow-y: scroll;">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +

            '<div class="layui-form-item">' +
                '<label class="layui-form-label">分组名称</label>' +
                '<div class="layui-input-inline text-w-250">' +
                    '<input type="text" name="groupName" value="'+ param.groupName +'" maxlength="20" lay-verify="required" lay-reqText="输入分组名称，最多20字" required placeholder="输入分组名称，最多20字" autocomplete="off" class="layui-input">'+
                '</div>' +
            '</div>' +
            '<div class="layui-form-item">' +
                '<label class="layui-form-label">首页标题</label>' +
                '<div class="layui-input-inline text-w-250">' +
                    '<input type="text" name="homePageTitle" value="'+ param.homePageTitle +'" maxlength="20" lay-verify="required" lay-reqText="输入首页标题，最多20字" required placeholder="输入首页标题，最多20字" autocomplete="off" class="layui-input">'+
                '</div>' +
            '</div>' +
            '<div class="layui-form-item">' +
                '<label class="layui-form-label">园区范围<i class="iconfont ibs-ico-helpnormal font-12 ml-5" title="分组小程序只能在所选的园区范围中切换园区"></i></label>' +
                '<div class="layui-input-inline text-w-250">' +
                    '<div class="layui-form-mid">' +
                        '<div class="selectArea">'+ param.parkNames+'</div>' +
                        '<a href="javascript:;" class="c-link select">选择</a>' +
                    '</div>' +
                '</div>' +

                '<input type="hidden" name="parkNames" value="'+ param.parkNames +'">'+
                '<input type="hidden" name="parkIds" value="'+ param.parkIds +'">'+
            '</div>' +
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    // 客服电话(单个)
    function getPhoneSingleDialogHtml(parkName, phone, isInherit) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">园区名称</label>' +
                                '<div class="layui-form-mid">'+ parkName +'</div>' +
                            '</div>';

        if(isInherit == '0') {
            // 不继承
            _html += '<div class="layui-form-item">' +
                        '<label class="layui-form-label">客服电话</label>' +
                        '<div class="layui-input-inline text-w-200">' +
                            '<input type="text" name="phone" value="'+ phone +'" lay-verify="fixedPhone2" maxlength="12"  lay-reqText="请输入客服电话" required placeholder="请输入客服电话" autocomplete="off" class="layui-input">'+
                        '</div>';
        } else {
            // 继承
            _html += '<div class="layui-form-item">' +
                        '<label class="layui-form-label">客服电话</label>' +
                        '<div class="layui-input-inline text-w-200">' +
                            '<input type="text" name="phone" value="'+ phone +'" lay-verify="fixedPhone2" maxlength="12"  lay-reqText="请输入客服电话" required placeholder="请输入客服电话" autocomplete="off" class="layui-input disabled" disabled>'+
                        '</div>';
        }

        if(isInherit == '0') {
            // 不继承
            _html += '<input type="checkbox" name="isInherit" lay-filter="isInherit" lay-skin="primary" title="继承全局设置" value="0">';
        } else {
            // 已设置
            _html += '<input type="checkbox" name="isInherit" lay-filter="isInherit" lay-skin="primary" title="继承全局设置" value="1">';
        }

        _html +=    '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 设置单笔支付限额（全局）
    function getAmountDialogHtml(amount) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item" style="padding: 20px 20px 0 20px;">' +
                                '<div class="layui-input-inline text-w-350">' +
                                    '<input type="text" name="amount" value="'+ amount +'" lay-verify="required|onlyDecmal9Ex0"  lay-reqText="请输入支付限额" required placeholder="请输入支付限额" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                                '<div class="layui-form-mid">元</div>' +
                                '<div style="clear: both; margin-top: 10px;" class="c-gray-light"><span>每个园区的单笔支付限额默认继承此处设置的值，除非园区进行了例外设置</span></div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }


    function getAmountSingleDialogHtml(parkName, payStatus, amount, isInherit) {
        var _html = '<div class="layui-card-body" style="height: 180px;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                        '<div class="layui-form-item">' +
                            '<label class="layui-form-label text-w-100">园区名称</label>' +
                            '<div class="layui-form-mid">'+ parkName +'</div>' +
                        '</div>';

        _html += '<div class="layui-form-item">' +
                    '<label class="layui-form-label text-w-100">小程序支付</label>' +
                    '<div class="layui-input-block">' +
                        '<input type="radio" name="status" lay-filter="status" value="1" title="开启">'+
                        '<input type="radio" name="status" lay-filter="status" value="0" title="关闭">' +
                    '</div>' +
                 '</div>';

        if(payStatus == '1') {
            // 开启
            _html += '<div class="payWrap">';
            if(isInherit == '0') {
                // 不继承
                _html += '<div class="layui-form-item">' +
                    '<label class="layui-form-label text-w-100">单笔支付限额</label>' +
                    '<div class="layui-input-inline text-w-200">' +
                    '<input type="text" name="amount" value="'+ amount +'" lay-verify="onlyDecmal9Ex0"  lay-reqText="请输入支付限额" required placeholder="请输入支付限额" autocomplete="off" class="layui-input">'+
                    '</div>';
            } else {
                // 继承
                _html += '<div class="layui-form-item">' +
                    '<label class="layui-form-label text-w-100">单笔支付限额</label>' +
                    '<div class="layui-input-inline text-w-200">' +
                    '<input type="text" name="amount" value="'+ amount +'" lay-verify="onlyDecmal9Ex0"  lay-reqText="请输入支付限额" required placeholder="请输入支付限额" autocomplete="off" class="layui-input disabled" disabled>'+
                    '</div>';
            }

            if(isInherit == '0') {
                // 不继承
                _html += '<input type="checkbox" name="isInherit" lay-filter="isInherit" lay-skin="primary" title="继承全局设置" value="0">';
            } else {
                // 已设置
                _html += '<input type="checkbox" name="isInherit" lay-filter="isInherit" lay-skin="primary" title="继承全局设置" value="1">';
            }

            _html +=    '</div></div>';
        } else {
            // 关闭
            _html += '<div class="payWrap hidden">' +
                        '<div class="layui-form-item">' +
                            '<label class="layui-form-label text-w-100">单笔支付限额</label>' +
                            '<div class="layui-input-inline text-w-200">' +
                                '<input type="text" name="amount" value="" disabled lay-verify="onlyDecmal9Ex0"  lay-reqText="请输入支付限额" required placeholder="请输入支付限额" autocomplete="off" class="layui-input">'+
                            '</div>' +
                            '<input type="checkbox" name="isInherit" lay-filter="isInherit" lay-skin="primary" title="继承全局设置" value="0" disabled>' +
                        '</div>'+
                      '</div>';
        }
        if(payStatus == '1') {
            // 开启
            _html += '<div class="layui-form-item hidden showTips" style="padding-left: 40px;">' +
                        '<p class="c-orange pl-10">在线支付关闭后，对应的费用账单（租金、电费）也将不会再进行推送</p>' +
                    '</div>';
        } else {
            // 关闭
            _html += '<div class="layui-form-item showTips" style="padding-left: 40px;">' +
                        '<p class="c-orange pl-10">在线支付关闭后，对应的费用账单（租金、电费）也将不会再进行推送</p>' +
                     '</div>';
        }
        _html +=
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    // 预付费收费规则设置
    function getPreChargeDialogHtml(exceed, deadline) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-100">应收日期定义：</label>' +
                                '<div class="layui-form-mid">【费用周期开始日期】提前</div>' +
                                '<div class="layui-input-inline text-w-80">' +
                                    '<input type="text" name="exceed" value="'+ exceed +'" lay-verify="required|integer2" required autocomplete="off" class="layui-input">'+
                                '</div>'+
                                '<div class="layui-form-mid">天</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-100">逾期天数定义：</label>' +
                                '<div class="layui-form-mid">当前日期超过【应收日期+</div>' +
                                '<div class="layui-input-inline text-w-80">' +
                                    '<input type="text" name="deadline" value="'+ deadline +'" lay-verify="required|integer2" required autocomplete="off" class="layui-input">'+
                                '</div>'+
                                '<div class="layui-form-mid">天】开始算逾期</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 后付费收费规则设置
    function getPostChargeDialogHtml(exceed, deadline) {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label text-w-100">应收日期定义：</label>' +
            '<div class="layui-form-mid">【最后一次抄表日期】延后</div>' +
            '<div class="layui-input-inline text-w-80">' +
            '<input type="text" name="exceed" value="'+ exceed +'" lay-verify="required|integer2" required autocomplete="off" class="layui-input">'+
            '</div>'+
            '<div class="layui-form-mid">天</div>' +
            '</div>' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label text-w-100">逾期天数定义：</label>' +
            '<div class="layui-form-mid">当前日期超过【应收日期+</div>' +
            '<div class="layui-input-inline text-w-80">' +
            '<input type="text" name="deadline" value="'+ deadline +'" lay-verify="required|integer2" required autocomplete="off" class="layui-input">'+
            '</div>'+
            '<div class="layui-form-mid">天】开始算逾期</div>' +
            '</div>' +
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    function getExpireRemindDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item" style="margin-left: 40px;">' +
                                '<div class="layui-form-mid">合同到期日期提前</div>' +
                                '<div class="layui-input-inline text-w-80">' +
                                    '<select name="remind" lay-filter="remind" lay-search>' +
                                        '<option value="7">7天</option>' +
                                        '<option value="15">15天</option>' +
                                        '<option value="30">30天</option>' +
                                        '<option value="45">45天</option>' +
                                        '<option value="60">60天</option>' +
                                        '<option value="90">90天</option>' +
                                        '<option value="100">100天</option>' +
                                        '<option value="120">120天</option>' +
                                    '</select>' +
                                '</div>' +
                                '<div class="layui-form-mid">进行到期提醒</div>' +
                            '</div>' +
                            '<div class="layui-form-item" style="margin-bottom: 0;">' +
                            '<div class="layui-input-block" style="margin-left: 42px; color: #888;"><i class="iconfont ibs-ico-tips" style="color:#5FB878;"></i>本设置对所有园区生效</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 设置虚拟孵化租期
    function getVituralRentDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog" style="padding: 0 20px;">' +
                        '<div class="layui-form-item" style="margin-bottom: 0;">' +
                            '<div class="layui-form-mid">虚拟孵化客户签约时，合同租期固定为</div>' +
                            '<div class="layui-input-inline" style="width: 140px;">' +
                                '<select name="duration" lay-filter="duration" lay-verify="required">' +
                                    '<option value="">请选择</option>' +
                                    '<option value="0.5">半年</option>' +
                                    '<option value="1">1年</option>' +
                                    '<option value="2">2年</option>' +
                                    '<option value="3">3年</option>' +
                                    '<option value="4">4年</option>' +
                                    '<option value="5">5年</option>' +
                                    '<option value="6">6年</option>' +
                                    '<option value="7">7年</option>' +
                                    '<option value="8">8年</option>' +
                                    '<option value="9">9年</option>' +
                                    '<option value="10">10年</option>' +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                        '<div class="layui-form-item">' +
                            '<div class="layui-input-block" style="margin-left: 0;"><i class="iconfont ibs-ico-tips" style="color:#5FB878;"></i>以上设置对所有园区生效</div>' +
                        '</div>' +
                        '<input type="hidden" name="mode" value="1">' +
                        '<!--写一个隐藏的btn -->' +
                        '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                        '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 设置虚拟孵化保证金
    function getVituralDepositDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog" style="padding: 0 20px;">' +
                            '<div class="layui-form-item" style="margin-bottom: 0;">' +
                                '<div class="layui-form-mid">' +
                                    '<input type="radio" name="mode" lay-filter="mode" value="0" title="允许自由输入金额">' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-input-block" style="margin-left: 30px;">虚拟孵化客户签约时，保证金可自由输入</div>'+
                            '<div class="layui-form-item" style="margin-bottom: 0;">' +
                                '<div class="layui-form-mid" style="margin-left: 0;">' +
                                    '<input type="radio" name="mode" lay-filter="mode" value="1" title="不能低于">' +
                                '</div>' +
                                '<div class="layui-form-mid" style="width: 140px; margin-left: -20px;">' +
                                    '<select name="duration" lay-filter="duration" lay-verify="duration">' +
                                        '<option value="">请选择</option>' +
                                        '<option value="0.5">半年</option>' +
                                        '<option value="1">1年</option>' +
                                        '<option value="2">2年</option>' +
                                    '</select>' +
                                '</div>' +
                                '<div class="layui-form-mid" style="margin-top: 8px;">孵化服务费</div>' +
                            '</div>' +
                            '<div class="layui-input-block" style="margin-left: 30px;">虚拟孵化客户签约时，保证金不能低于<b style="margin: 0 5px;" id="fixedDuration"></b>年孵化服务费</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 0;"><i class="iconfont ibs-ico-tips" style="color:#5FB878;"></i>以上设置对所有园区生效</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    $(function() {
        init();
        // 企业微信通讯录API
        $(document).on('click', '.openWorkWechat', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                key = $o.attr('data-key'),
                isOpen = $o.attr('data-value'),
                corpId = $o.attr('data-corp-id'),
                corpSecret = $o.attr('data-crop-secret');
            corpId = typeof corpId == 'undefined' ? '' : corpId;
            corpSecret = typeof corpSecret == 'undefined' ? '' : corpSecret;

            Dialog.formDialog({
                title: '企业微信通讯录API',
                content: getWechatHtml(isOpen, corpId, corpSecret),
                area: ['550px', 'auto'],
                success: function(layero, index) {
                    form.val('formDialog', {open: isOpen});
                    form.render();    // 表单渲染
                    form.on('radio(open)', function (data) {
                        var $corpIdInput = layero.find('input[name=corpId]'),
                            $corpSecretInput = layero.find('input[name=corpSecret]');
                        if(data.value == '0') {
                            // 关闭
                            $corpSecretInput.addClass('disabled');
                            $corpSecretInput.attr('readonly', true);
                            $corpIdInput.addClass('disabled');
                            $corpIdInput.attr('readonly', true);
                        } else {
                            // 开启
                            $corpSecretInput.removeClass('disabled');
                            $corpSecretInput.attr('readonly', false);
                            $corpIdInput.removeClass('disabled');
                            $corpIdInput.attr('readonly', false);
                        }
                    });
                    form.on('submit(bind)', function(data){
                        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
                        var isOpen = layero.find('input[name=open]:checked').val();

                        $.ajax({
                            url: url,
                            type: 'POST',
                            dataType: 'json',
                            data: data.field
                        })
                        .done(function(res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    if(res.data.url) {
                                        window.location.href = res.data.url;
                                    } else {
                                        window.location.reload();
                                    }
                                });
                                // layer.close(index);
                                // $o.attr('data-value', isOpen);
                                // $o.attr('data-corp-id', corpId);
                                // $o.attr('data-crop-secret', corpSecret);
                                // if(isOpen == '1') {
                                //     $('.td_' + key).text('开启');
                                //     if(res.data.url) {
                                //         window.location.href = res.data.url;
                                //     }
                                // } else {
                                //     $('.td_' + key).text('关闭');
                                // }
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        })
                        .always(function() {
                            layer.close(layerIndex);
                        });
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            });
        });

        // 页面水印
        $(document).on('click', '.openPageWatermark', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                key = $o.attr('data-key'),
                isOpen = $o.attr('data-value');

            Dialog.formDialog({
                title: '设置页面水印',
                content: getWaterHtml(),
                success: function(layero, index) {
                    form.val('formDialog', {open: isOpen});
                    form.render();    // 表单渲染
                    form.on('submit(bind)', function(data){
                        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
                        var isOpen = layero.find('input[name=open]:checked').val();

                        $.ajax({
                            url: url,
                            type: 'POST',
                            dataType: 'json',
                            data: data.field
                        })
                            .done(function(res) {
                                if(res.status) {
                                    Dialog.successDialog(res.msg);
                                    layer.close(index);
                                    $o.attr('data-value', isOpen);
                                    if(isOpen == '1') {
                                        $('.td_' + key).text('显示水印');
                                        Common.loadWaterMark(userUuId,'1');
                                    } else {
                                        $('.td_' + key).text('不显示水印');
                                        Common.loadWaterMark(userUuId,'0');
                                    }
                                } else {
                                    Dialog.errorDialog(res.msg);
                                }
                            })
                            .always(function() {
                                layer.close(layerIndex);
                            });
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            });
        });

        // 应收账审核模式
        $(document).on('click', '.openAccountReceivable', function() {
            var $o = $(this),
                url = $(this).attr('data-url'),
                key = $o.attr('data-key'),
                mode = $(this).attr('data-value'); // 1: 普通审核模式  2: 双重验证模式

            Dialog.formDialog({
                title: '设置应收账审核模式',
                content: getAccountReceiveHtml(),
                success: function(layero, index) {
                    form.val('formDialog',{mode: mode});
                    form.render();
                    form.on('submit(bind)', function(data){
                        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
                        var mode = layero.find('input[name=mode]:checked').val();

                        $.ajax({
                            url: url,
                            type: 'POST',
                            dataType: 'json',
                            data: data.field
                        })
                            .done(function(res) {
                                if(res.status) {
                                    Dialog.successDialog(res.msg);
                                    layer.close(index);
                                    $o.attr('data-value', mode);
                                    if(mode == '1') {
                                        $('.td_' + key).text('已设置为 普通审核模式');
                                    } else {
                                        $('.td_' + key).text('已设置为 双重验证模式');
                                    }
                                } else {
                                    Dialog.errorDialog(res.msg);
                                }
                            })
                            .always(function() {
                                layer.close(layerIndex);
                            });
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            });
        });

        // 入驻前客户绑定
        $(document).on('click', '.openCustomerBind', function() {
            var $o = $(this),
                url = $(this).attr('data-url'),
                key = $o.attr('data-key'),
                mode = $(this).attr('data-value'); // 1: 普通审核模式  2: 双重验证模式

            Dialog.formDialog({
                title: '设置入驻前客户绑定',
                content: getOpenCustomerBindHtml(),
                success: function(layero, index) {
                    form.val('formDialog',{mode: mode});
                    form.render();
                    form.on('submit(bind)', function(data){
                        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
                        var mode = layero.find('input[name=mode]:checked').val();

                        $.ajax({
                            url: url,
                            type: 'POST',
                            dataType: 'json',
                            data: data.field
                        })
                            .done(function(res) {
                                if(res.status) {
                                    Dialog.successDialog(res.msg, function () {
                                        window.location.reload();
                                    });
                                    layer.close(index);
                                } else {
                                    Dialog.errorDialog(res.msg);
                                }
                            })
                            .always(function() {
                                layer.close(layerIndex);
                            });
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            });
        });

        // 添加运营公司
        $(document).on('click', '.ajaxTableAdd', function() {
            var url = $(this).attr('data-url'),
                name = '';
            addEditCompany('添加', url, name);
        });

        // 编辑运营公司
        $(document).on('click', '.ajaxTableEdit', function() {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');
            addEditCompany('编辑', url, name);
        });

        // 删除运营公司
        $(document).on('click', '.ajaxTableDel', function() {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');

            Dialog.delDialog({
                content: '<div style="padding: 20px;">确定要删除【'+ name +'】吗？</div>',
                yesFn: function(index, layero) {
                    var layerIndex = layer.load(2, {shade: [0.1, '#000']});
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                    })
                        .done(function(res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg);
                                layer.close(index);
                                if(res.data.url) {
                                    Pager.renderPager(res.data.url);
                                }
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        })
                        .always(function() {
                            layer.close(layerIndex);
                        });
                }
            });
        });

        // 搜索
        $(document).on('click', '.ajaxSearch', function(e) {
            var param  = getSplitParam();
            Pager.renderPager(param);
            return false;
        });

        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                var param  = getSplitParam();
                Pager.renderPager(param);
            }
        });

        $(document).on('click', '.layui-edge', function() {
            var order = $(this).attr('data-order'),
                $o = $(this);
            if(order == '0') {
                // 升序
                $o.parent().attr('lay-sort', 'asc');
            } else if(order == '1') {
                // 降序
                $o.parent().attr('lay-sort', 'desc');
            }
            $('#pageOrderValue').val(order);

            var param  = getSplitParam();
            Pager.renderPager(param);
        });

        // 存量合同入口设置
        $(document).on('click', '.ajaxChangeStatus', function() {
            var url = $(this).attr('data-url'),
                $o = $(this);

            Req.getReq(url, function(res) {
                if(res.status) {
                    Dialog.successDialog(res.msg);
                    if(res.data.url) {
                        Pager.renderPager(res.data.url);
                    }
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 客服电话设置(全局)
        $(document).on('click', '.ajaxSettingPhone', function () {
            var $o = $(this),
                phone = $o.attr('data-phone') ? $o.attr('data-phone') : '',
                url = $o.attr('data-url');
            Dialog.formDialog({
                title: '设置客服电话（全局）',
                content: getPhoneDialogHtml(phone),
                success: function(layero, index) {
                    form.render();
                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();
                        var $phoneNum = layero.find('input[name=phone]');

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    $('.phoneSpan').text($phoneNum.val());
                                    $('.ajaxSettingPhone').attr('data-phone', $phoneNum.val());
                                    // if(res.data.url) {
                                    //     window.location.href = res.data.url;
                                    // } else {
                                    //     window.location.reload();
                                    // }
                                    layer.close(index);
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });

        // 客户电话（单个）
        $(document).on('click', '.signlePhone', function () {
            var $o = $(this),
                parkName = $o.attr('data-park-name') ? $o.attr('data-park-name') : '',
                phone = $o.attr('data-phone') ? $o.attr('data-phone') : '',
                isInherit = $o.attr('data-inherit') ? $o.attr('data-inherit') : '0', // 默认不继承
                url = $o.attr('data-url');

            Dialog.formDialog({
                title: '设置客服电话',
                content: getPhoneSingleDialogHtml(parkName, phone, isInherit),
                area: ['480px', 'auto'],
                success: function(layero, index) {
                    form.val('formDialog', {
                        isInherit: isInherit == '1' ? true : false
                    });
                    form.render(null, 'formDialog');

                    // 继承全局设置
                    form.on('checkbox(isInherit)', function(data){
                        var $input = layero.find('input[name=phone]');
                        var $checkbox = layero.find('input[name=isInherit]');
                        if(this.checked) {
                            // 选中,继承
                            $input.addClass('disabled');
                            $input.attr('disabled', true);
                            $input.val('');
                            $checkbox.val(1);
                        } else {
                            $input.removeClass('disabled');
                            $input.attr('disabled', false);
                            $checkbox.val(0);
                        }
                    });

                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    $('.ajaxSearch').trigger('click');
                                    layer.close(index);
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });

        // 客户在线支付调整（全局）
        $(document).on('click', '.adjustAmount', function () {
            var $o = $(this),
                amount = $o.attr('data-amount') ? $o.attr('data-amount') : '',
                url = $o.attr('data-url');

            Dialog.formDialog({
                title: '设置单笔支付限额（全局）',
                content: getAmountDialogHtml(amount),
                area: ['480px', 'auto'],
                success: function(layero, index) {

                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();
                        var $amount = layero.find('input[name=amount]');

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    // if(res.data.url) {
                                    //     window.location.href = res.data.url;
                                    // } else {
                                    //     window.location.reload();
                                    // }
                                    $('.globalAmount').text($amount.val());
                                    $('.adjustAmount').attr('data-amount', $amount.val());
                                    layer.close(index);
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });

        // 客户在线支付调整（单个）
        $(document).on('click', '.singleAmount', function () {
            var $o = $(this),
                isInherit = $o.attr('data-inherit'),
                parkName = $o.attr('data-park-name') ? $o.attr('data-park-name') : '',
                amount = $o.attr('data-amount') ? $o.attr('data-amount') : '',
                payStatus = $o.attr('data-status'),         // 1: 开启   0: 关闭
                url = $o.attr('data-url');

            Dialog.formDialog({
                title: '设置单笔支付限额',
                content: getAmountSingleDialogHtml(parkName, payStatus, amount, isInherit),
                area: ['520px', 'auto'],
                success: function(layero, index) {

                    form.val('formDialog', {
                        isInherit: isInherit == '1' ? true : false,
                        status: payStatus
                    });
                    form.render(null, 'formDialog');

                    form.on('radio(status)', function (data) {
                        if(data.value == '1') {
                            // 开启
                            layero.find('.payWrap').removeClass('hidden');
                            layero.find('input[name=amount]').attr('disabled', false);
                            layero.find('input[name=amount]').removeClass('disabled');
                            layero.find('input[name=isInherit]').prop('checked', false);
                            layero.find('input[name=isInherit]').attr('disabled', false);
                            layero.find('.showTips').addClass('hidden');
                            form.render(null, 'formDialog');
                        } else {
                            // 关闭
                            layero.find('.payWrap').addClass('hidden');
                            layero.find('input[name=amount]').attr('disabled', true);
                            layero.find('input[name=amount]').addClass('disabled');
                            layero.find('input[name=isInherit]').attr('disabled', true);
                            layero.find('.showTips').removeClass('hidden');
                        }
                    });

                    // 继承全局设置
                    form.on('checkbox(isInherit)', function(data){
                        var $input = layero.find('input[name=amount]');
                        var $checkbox = layero.find('input[name=isInherit]');
                        if(this.checked) {
                            // 选中
                            $input.addClass('disabled');
                            $input.attr('disabled', true);
                            $input.val('');
                            $checkbox.val(1);
                        } else {
                            $input.removeClass('disabled');
                            $input.attr('disabled', false);
                            $checkbox.val(0);
                        }
                    });

                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    // if(res.data.url) {
                                    //     window.location.href = res.data.url;
                                    // } else {
                                    //     window.location.reload();
                                    // }
                                    $('.ajaxSearch').trigger('click');
                                    layer.close(index);
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });


        // 预付费收费规则
        $(document).on('click', '.ajaxPreCharge', function () {
            var $o = $(this),
                url = $o.attr('data-url');
            var deadline = $o.attr('data-deadline-day'),
                exceed = $o.attr('data-exceed_day');
            Dialog.formDialog({
                title: '预付费收费规则设置',
                area: ['540px', 'auto'],
                content: getPreChargeDialogHtml(exceed, deadline),
                success: function (layero, index) {
                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            });
        });

        // 后付费收费规则
        $(document).on('click', '.ajaxPostCharge', function () {
            var $o = $(this),
                url = $o.attr('data-url');
            var deadline = $o.attr('data-deadline-day'),
                exceed = $o.attr('data-exceed_day');

            Dialog.formDialog({
                title: '后付费收费规则设置',
                area: ['540px', 'auto'],
                content: getPostChargeDialogHtml(exceed, deadline),
                success: function (layero, index) {
                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });

        form.verify({
            // 客服电话
            fixedPhone2: function(value, item) {
                if(!$(item).prop("disabled")) {
                    var reg = /^[\+]?\d+$/;
                    if(!reg.test(value)) {
                        return '支持最多12位纯数字!';
                    }
                }
            }
        });

        element.on('tab(docDemoTabBrief)', function(data){
            var curTabTitle = $(data.elem.context).text();
            var $cites = $('.layui-breadcrumb cite'),
                $lastCite = $cites.eq($cites.length - 1);
            $lastCite.text(curTabTitle);
        });

        /**
         * 房源类设置
         */
        // 底价调整管控
        $(document).on('click', '.openBottomPrice', function () {
            var $o = $(this),
                infoUrl = $o.attr('data-info'),
                url = $o.attr('data-url');

            Req.getReq(infoUrl, function (res) {
                if(res.status) {
                    var result = res.data.data;
                    var modeArr = [];
                    result.forEach(function (item, index) {
                        modeArr.push(item.setValue);
                    });
                    Dialog.formDialog({
                        title: '设置底价调整管控',
                        area: ['540px', 'auto'],
                        content: getBottomPriceDialogHtml(),
                        success: function (layero, index) {
                            form.val('formDialog', {
                                rent: modeArr[0],
                                rent2: modeArr[1],
                                property: modeArr[2]
                            });
                            form.render(null, 'formDialog');
                            form.on('submit(bind)', function(data) {
                                var $form = layero.find('form'),
                                    data = $form.serializeArray();

                                Req.postReq(url, data, function (res) {
                                    if(res.status) {
                                        Dialog.successDialog(res.msg, function () {
                                            window.location.reload();
                                        });
                                    } else {
                                        Dialog.errorDialog(res.msg);
                                    }
                                });
                                return false;
                            })
                        }
                    })
                }
            });
        });

        // 房源底价显示
        $(document).on('click', '.openHousePriceShow', function() {
            var $o = $(this),
                url = $(this).attr('data-url'),
                mode = $(this).attr('data-value');

            Dialog.formDialog({
                title: '设置房源底价显示',
                content: getHousePriceDialogHtml(),
                success: function(layero, index) {
                    form.val('formDialog',{mode: mode});
                    form.render();
                    form.on('submit(bind)', function(data){
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            });
        });


        /**
         * 招商运营类设置
         */
        // 到期提醒设置
        $(document).on('click', '.openExpireRemind', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                day  = $o.attr('data-value');

            Dialog.formDialog({
                title: '设置到期提醒',
                area: ['540px', 'auto'],
                content: getExpireRemindDialogHtml(),
                success: function (layero, index) {
                    form.val('formDialog', {remind: day});
                    form.render(null, 'formDialog');
                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });

        // 虚拟孵化期设置（允许自由输入租期去除）
        $(document).on('click', '.openLeaseTerm', function () {
            var $o = $(this),
                url = $o.attr('data-url');
            var duration = parseFloat($o.attr('data-value'));

            Dialog.formDialog({
                title: '设置虚拟孵化租期',
                area: ['540px', 'auto'],
                content: getVituralRentDialogHtml(),
                success: function (layero, index) {
                    form.val('formDialog', {
                        duration: duration
                    });
                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });

        // $(document).on('click', '.openLeaseTerm', function () {
        //     var $o = $(this),
        //         url = $o.attr('data-url');
        //     var duration = parseFloat($o.attr('data-value'));
        //     var mode = 0;
        //     if(duration > 0) {
        //         mode = 1;   // 固定
        //     }
        //
        //     Dialog.formDialog({
        //         title: '设置虚拟孵化租期',
        //         area: ['540px', '340px'],
        //         content: getVituralRentDialogHtml(),
        //         success: function (layero, index) {
        //             if(mode == 1) {
        //                 // 固定租期
        //                 form.val('formDialog', {
        //                     mode: mode,
        //                     duration: duration
        //                 });
        //                 layero.find('#fixedDuration').text(getFixedRentTxt(duration));
        //             } else {
        //                 // 自由
        //                 layero.find('select[name=duration]').prop('disabled', true);
        //                 form.val('formDialog', {
        //                     mode: mode
        //                 });
        //             }
        //
        //             form.render(null, 'formDialog');
        //
        //             form.verify({
        //                duration: function (value, item) {
        //                    var data = form.val('formDialog');
        //                    if(data.mode == '1') {
        //                        if(!/[\S]+/.test(value)) {
        //                            return '必填项不能为空';
        //                        }
        //                    }
        //                }
        //             });
        //
        //             form.on('radio(mode)', function (data) {
        //                 if(data.value == '1') {
        //                     // 固定
        //                     layero.find('select[name=duration]').prop('disabled', false);
        //                 } else {
        //                     // 自由
        //                     layero.find('select[name=duration]').prop('disabled', true);
        //                 }
        //                 form.render(null, 'formDialog');
        //             });
        //
        //             form.on('select(duration)', function (data) {
        //                 if(data.value) {
        //                     layero.find('#fixedDuration').text(getFixedRentTxt(data.value));
        //                 }
        //             });
        //
        //             form.on('submit(bind)', function(data) {
        //                 var $form = layero.find('form'),
        //                     data = $form.serializeArray();
        //
        //                 Req.postReq(url, data, function (res) {
        //                     if(res.status) {
        //                         Dialog.successDialog(res.msg, function () {
        //                             window.location.reload();
        //                         });
        //                     } else {
        //                         Dialog.errorDialog(res.msg);
        //                     }
        //                 });
        //                 return false;
        //             })
        //         }
        //     })
        // });

        // 虚拟孵化保证金
        $(document).on('click', '.openDepositTerm', function () {
            var $o = $(this),
                url = $o.attr('data-url');
            var duration = parseFloat($o.attr('data-value'));
            var mode = 0;
            if(duration > 0) {
                mode = 1;   // 固定
            }

            Dialog.formDialog({
                title: '设置虚拟孵化保证金',
                area: ['540px', '340px'],
                content: getVituralDepositDialogHtml(),
                success: function (layero, index) {
                    if(mode == 1) {
                        // 固定租期
                        form.val('formDialog', {
                            mode: mode,
                            duration: duration
                        });
                        layero.find('#fixedDuration').text(getFixedRentTxt(duration));
                    } else {
                        // 自由
                        layero.find('select[name=duration]').prop('disabled', true);
                        form.val('formDialog', {
                            mode: mode
                        });
                    }
                    form.render(null, 'formDialog');

                    form.verify({
                        duration: function (value, item) {
                            var data = form.val('formDialog');
                            if(data.mode == '1') {
                                if(!/[\S]+/.test(value)) {
                                    return '必填项不能为空';
                                }
                            }
                        }
                    });

                    form.on('radio(mode)', function (data) {
                        if(data.value == '1') {
                            // 固定
                            layero.find('select[name=duration]').prop('disabled', false);
                        } else {
                            // 自由
                            layero.find('select[name=duration]').prop('disabled', true);
                        }
                        form.render(null, 'formDialog');
                    });

                    form.on('select(duration)', function (data) {
                        if(data.value) {
                            layero.find('#fixedDuration').text(getFixedRentTxt(data.value));
                        }
                    });

                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });

        /**
         * 费用类设置
         */
        // 回款统计口径
        $(document).on('click', '.openStatisticMode', function () {
            var $o = $(this),
                url = $o.attr('data-url');
            var value = $o.attr('data-value');

            Dialog.formDialog({
                title: '设置回款统计口径',
                area: ['540px', 'auto'],
                content: getStatisticDialogHtml(),
                success: function (layero, index) {
                    form.val('formDialog', {
                        statMode: value
                    });
                    form.render(null, 'formDialog');
                    form.on('submit(bind)', function(data) {
                        var $form = layero.find('form'),
                            data = $form.serializeArray();

                        Req.postReq(url, data, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    })
                }
            })
        });


        /**
         * 小程序设置
         */
        // 复制
        $(document).on('click', '.copytxt', function () {
            var copyTxt = $(this).attr('data-value');
            Common.Util.copyToClipboard(copyTxt);
            // Common.Util.selectText($(this)[0]);
            // document.execCommand('copy');
            Dialog.successDialog("复制成功");
        });

        // 首页标题
        $(document).on('click', '.editTitle', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                value = $o.attr('data-value');

            Dialog.formDialog({
                title: '修改小程序首页标题',
                content: getAppTitleDialogHtml(value),
                success: function (layero, index) {
                    var $form = layero.find('form');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                    })
                }
            })
        });

        $(document).on('click', '.opendialog', function() {
            Dialog.tipDialog({
                title: '关联指引',
                area: ['520px', 'auto'],
                content: '<p>第1步：登录微信商户平台（<a></a>https://pay.weixin.qq.com），进入产品中心-->APPID授权管理。</p>' +
                    '<p class="mt-10">第2步：新增授权，APPID输入【wx57ef8d31c6b493d1】，认证主体输入【苏州欧帕克信息技术有限公司】，绑定类型选择【技术合作】，然后等待微信支付业务审核，审核周期为1-3个工作日。</p>' +
                    '<p class="mt-10">第3步：审核通过后，联系OPark技术客服（13918101989），完成双方确认。</p>' +
                    '<p class="mt-10" style="color:#888; white-space: nowrap">提示：操作过程中若有疑问，可添加OPark客服QQ（1989968151）咨询。</p>',
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            })
        });

        // 微信支付商户号
        $(document).on('click', '.setWeixin', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                value = $o.attr('data-value') ? $o.attr('data-value') : '';

            Dialog.formDialog({
                title: '设置微信支付商户号',
                content: getWeiXinAccountDialogHtml(value),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.on('submit(bind)', function () {
                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                        return false;
                    })
                }
            })
        });

        // 重设微信支付商户号
        $(document).on('click', '.setWeixinRe', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                value = $o.attr('data-value') ? $o.attr('data-value') : '';

            Dialog.confirmDialog({
                title: '重设商户号',
                content: '必须保证商户号准确且已与小程序关联，否则会导致支付失败。确定要继续吗？',
                yesFn: function (index, layero) {
                    layer.close(index);
                    Dialog.formDialog({
                        title: '设置微信支付商户号',
                        content: getWeiXinAccountDialogHtml(value),
                        success: function (layero, index) {
                            var $form = layero.find('form');
                            form.on('submit(bind)', function () {

                                var param = $form.serializeArray();
                                Req.postReqCommon(url, param);
                                return false;
                            })
                        }
                    })
                }
            });
        });

        // 设置微信支付API密钥
        $(document).on('click', '.setWeixinPwd', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                value = $o.attr('data-value') ? $o.attr('data-value') : '';

            Dialog.formDialog({
                title: '设置微信支付API密钥',
                content: getWeiXinKeyDialogHtml(value),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.on('submit(bind)', function () {

                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                        return false;
                    })
                }
            })
        });

        // 重新设置微信支付API密钥
        $(document).on('click', '.setWeixinPwdRe', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                value = $o.attr('data-value') ? $o.attr('data-value') : '';

            Dialog.confirmDialog({
                title: '重设密钥',
                content: '随意修改API密码会影响线上交易，只有当微信商户中更改了API密钥时这里才需要修改。确定要继续修改吗？',
                yesFn: function (index, layero) {
                    layer.close(index);
                    Dialog.formDialog({
                        title: '设置微信支付API密钥',
                        content: getWeiXinKeyDialogHtml(value),
                        success: function (layero, index) {
                            var $form = layero.find('form');
                            form.on('submit(bind)', function () {

                                var param = $form.serializeArray();
                                Req.postReqCommon(url, param);
                                return false;
                            })
                        }
                    })
                }
            });
        });

        // apiclient_cert.p12 证书
        $(document).on('click', '.uploadCer', function() {
            var $o = $(this),
                url = $o.attr('data-url');
            var result = [];
            Dialog.formDialog({
                title: '上传apiclient_cert.p12证书',
                content: getUploadCerDialogHtml(result),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    MUpload({
                        elem: layero.find('.uploadCerBtn'),
                        iframeIndex: 0,
                        exts: 'p12',
                        maxNum: 1,
                        choose:function(){},
                    });

                    form.on('submit(bind)', function () {
                        if(!layero.find('.upload-file-item').length) {
                            Dialog.errorDialog('请上传证书');
                            return false;
                        }
                        var reqParam = $form.serializeArray();
                        Req.postReqCommon(url, reqParam);
                        return false;
                    })
                }
            })
        });

        function addEditGroup(param) {
            Dialog.formDialog({
                title: param.title,
                content: getAddEditDialogHtml(param),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var $parkIds = layero.find('input[name=parkIds]'),
                        $parkNames = layero.find('input[name=parkNames]'),
                        $selectArea = layero.find('.selectArea');

                    layero.find('.select').click(function () {
                        if(!parkRangeList.length) return;

                        if(!$parkIds.val()) {
                            // 未添加过
                            DPTree({
                                title: '选择园区范围',
                                searchPlaceHolder: '搜索部门或园区',
                                data: parkRangeList,
                                zIndex: 99999999,
                                showOther: false,
                                showFreeze: false,
                                callback: function (instance) {
                                    $selectArea.html(instance.didTextArr.join('、'));
                                    $parkNames.val(instance.didTextArr.join(','));
                                    $parkIds.val(instance.didArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                            });
                        } else {
                            // 已添加过且再次添加，需要回填值
                            DPTree({
                                title: '选择园区范围',
                                searchPlaceHolder: '搜索部门或园区',
                                data: parkRangeList,
                                zIndex: 99999999,
                                showOther: false,
                                showFreeze: false,
                                callback: function (instance) {
                                    $selectArea.html(instance.didTextArr.join('、'));
                                    $parkNames.val(instance.didTextArr.join(','));
                                    $parkIds.val(instance.didArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                                edit: $parkIds.val().split(',')
                            });
                        }
                    });

                    form.on('submit(bind)', function () {

                        if(!$parkIds.val()) {
                            Dialog.errorDialog("请选择园区范围");
                            return false;
                        }

                        var reqParam = $form.serializeArray();
                        Req.postReqCommon(param.url, reqParam);
                        return false;
                    })
                }
            })
        }

        // 添加分组
        $(document).on('click', '.addGroup', function () {
            var $o = $(this),
                url = $o.attr('data-url');

            var param = {
                title: '添加分组',
                url: url,
                groupName: '',
                homePageTitle: '',
                parkIds: '',
                parkNames: ''
            };
            addEditGroup(param);
        });

        // 编辑分组
        $(document).on('click', '.editGroup', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                groupName = $o.attr('data-group-name'),
                homePageTitle = $o.attr('data-home-page-title'),
                parkIds = $o.attr('data-dept-id'),
                parkNames = $o.attr('data-dept-name');

            var param = {
                title: '编辑分组',
                url: url,
                groupName: groupName,
                homePageTitle: homePageTitle,
                parkIds: parkIds,
                parkNames: parkNames
            };
            addEditGroup(param);
        });

        // 删除分组
        $(document).on('click', '.delGroup', function () {
            var $o = $(this),
                groupName = $o.attr('data-group-name'),
                url = $o.attr('data-url');

            Dialog.confirmDialog({
                title: '提示',
                content: '确定要删除分组【'+ groupName +'】吗？',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            })
        });
        
        // 别名
        $(document).on('click', '.ajaxEditAlias', function () {
            var $o = $(this),
                alias = $o.attr('data-alias') ? $o.attr('data-alias') : '',
                url = $o.attr('data-url');


            Dialog.formDialog({
                title: '设置别名',
                content: getAliasDialogHtml(alias),
                success: function (layero, index) {
                    var $form = layero.find('form');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
                        if(data.field.alias.length < 2) {
                            Dialog.errorDialog('别名2-8个字');
                            return false;
                        }
                        Req.postReqCommon(url, param);
                    })
                }
            })
        });
    });
});