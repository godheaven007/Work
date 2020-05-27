layui.define(function(exports){
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form');

    /**
     * 渲染省市区数据
     * @param _type
     * @param list
     */
    function renderPCA(_type, list) {
        var $city = $form.find('select[name=city]'),
            $area = $form.find('select[name=area]');
        var _opts = '';

        if(_type == 'province') {
            _opts += '<option value="">选择市</option>';
        } else if(_type == 'city') {
            _opts += '<option value="">选择区</option>';
        }
        for(var i = 0, len = list.length; i < len; i++) {
            _opts += '<option value="'+ list[i].regionId +'">'+ list[i].regionName +'</option>';
        }

        if(_type == 'province') {
            $city.html(_opts);
            $area.html('');
        } else if(_type == 'city') {
            $area.html(_opts);
        }
        form.render();
    }

    /**
     * 省市为空
     * @param _type
     */
    function reset(_type) {
        var $city = $form.find('select[name=city]'),
            $area = $form.find('select[name=area]');
        var _cityOpts = '<option value="">选择市</option>',
            _areaOpts = '<option value="">选择区</option>';

        if(_type == 'province') {
            $city.html(_cityOpts);
            $area.html(_areaOpts);
        } else if(_type == 'city') {
            $area.html(_areaOpts);
        }
        form.render();
    }

    /**
     * 加载省市区数据
     * @param _type
     * @param _id
     */
    function loadPCA(_type, _id) {
        var url = $('#regionListAjaxUrl').val();

        $.getJSON(url + '?id=' + _id, function (res) {
            if(res.status) {
                renderPCA(_type, res.data.data);
            } else {
                // todo... 报错信息处理
                reset(_type);
            }
        });
    }

    function initPCA() {
        /**
         * 省市区联动
         */
        form.on('select(province)', function(data) {
            loadPCA('province', data.value);
            var $target = $(data.elem),
                optValue = $target.next('.layui-form-select').find('input').val();

            $form.find('input[name=provinceName]').val(optValue);

        });

        form.on('select(city)', function(data) {
            loadPCA('city', data.value);
            var $target = $(data.elem),
                optValue = $target.next('.layui-form-select').find('input').val();
            $form.find('input[name=cityName]').val(optValue);
        });

        form.on('select(area)', function(data) {
            var $target = $(data.elem),
                optValue = $target.next('.layui-form-select').find('input').val();
            $form.find('input[name=areaName]').val(optValue);
        });
    }

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('PCA', initPCA);
});