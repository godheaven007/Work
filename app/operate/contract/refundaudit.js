/**
 * 运营-合同-退租详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'laydate', 'upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;


    function init() {
        renderDatebox();
        MUpload({
            elem: $('.upload'),
            size: 1024 * 50,
            maxNum: 5,
            choose:function(){},
        });
    }

    function renderDatebox() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                btns: ['clear', 'now'],
                trigger: 'click'
            });
        });
    }

    function calcTotalMoney() {
        var $actualTotalAmount = $('.actual_refund_amount'),
            $shouldTotalAmounts = $('input[name=refund_total_amount]'),
            $elecFee = $('input[name=elec_fee]'),
            $waterFee = $('input[name=water_fee]'),
            $rentFee = $('input[name=rent_fee]'),
            $propertyFee = $('input[name=property_fee]'),
            $otherFee = $('input[name=other_fee]');

        var shouldTotalMoney = 0;
        $shouldTotalAmounts.each(function (i, o) {
            var curShouldMoney = isNaN(parseFloat($(o).val())) ? 0 : parseFloat($(o).val());
            shouldTotalMoney = Common.Util.accAdd(shouldTotalMoney, curShouldMoney);
        });


        var elecMoney = isNaN(parseFloat($elecFee.val())) ? 0 : parseFloat($elecFee.val());
        var waterMoney = isNaN(parseFloat($waterFee.val())) ? 0 : parseFloat($waterFee.val());
        var rentdMoney = isNaN(parseFloat($rentFee.val())) ? 0 : parseFloat($rentFee.val());
        var propertyMoney = isNaN(parseFloat($propertyFee.val())) ? 0 : parseFloat($propertyFee.val());
        var otherMoney = isNaN(parseFloat($otherFee.val())) ? 0 : parseFloat($otherFee.val());

        var r1 = Common.Util.accSub(elecMoney, shouldTotalMoney);
        var r2 = Common.Util.accSub(waterMoney, r1);
        var r3 = Common.Util.accSub(rentdMoney, r2);
        var r4 = Common.Util.accSub(propertyMoney, r3);
        var r5 = Common.Util.accSub(otherMoney, r4);

        $('#actual_refund_amount').val(r5);
        $actualTotalAmount.text(parseFloat(r5).toFixed(2));
    }

    $(function() {
        init();

        $(document).on('blur', 'input[name=refund_total_amount], ' +
                                 'input[name=elec_fee], ' +
                                 'input[name=water_fee], ' +
                                 'input[name=rent_fee], ' +
                                 'input[name=property_fee],' +
                                 'input[name=other_fee]', function () {
            var $o = $(this),
                money = $o.val();
            if(!Regex.onlyDecmal9.reg.test(money)) {
                Dialog.errorDialog(Regex.onlyDecmal9.msg);
                $o.focus();
            }
            calcTotalMoney();
        });

        // 提交校核
        form.on('submit(saveSubmit)', function (data) {
            var $form = $('form'),
                param = $form.serializeArray();
            var url = $(data.elem).attr('data-url');


            // if(!$('.upload-list').find('.upload-file-item').length) {
            //     Dialog.errorDialog('请上传附件');
            //     return false;
            // }

            Req.postReqCommon(url, param);
            return false;
        });
    });
});