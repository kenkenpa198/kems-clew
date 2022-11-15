$(function () {
    $('#works').each(function () {

        var $container = $(this),
            $loadMoreButton = $('#load-more'), // 追加ボタン
            $filter = $('#works-filter'),     // フィルタリングのフォーム
            addItemCount = 16,                // 一度に表示するアイテム数
            added = 0,                        // 表示済みのアイテム数
            allData = [],                     // すべての JSON データ
            filteredData = [];                // フィルタリングされた JSON データ


        // Home の場合は3つのみを表示するため addItemCount へ3を再代入する
        if ($('#home').length) {
            var addItemCount = 3;
        } 

        // オプションを設定して masonry を準備
        $container.masonry({
            itemSelector: '.works-item', // 要素のセレクタ
            columnWidth: 200,            // カラムの幅
            gutter: 16,                  // カラム間の左右の隙間
            fitWidth: 'true',            // 親の幅を自動調整して中央揃え
            transitionDuration: 'none'   // デフォルトの transition を削除（CSS と競合するため）
        });

        // JSON を取得し initWorks 関数を実行
        $.getJSON('./data/content.json', initWorks);

        // Works ギャラリーを初期化する関数
        function initWorks (data) {

            // 取得した JSON データを格納
            allData = data;

            // 新しい順（降順）で表示するため配列を逆順にする
            allData.reverse();

            // 最初の状態ではフィルタリングせずそのまま全データを渡す
            filteredData = allData;

            // 最初のアイテム群を表示
            addItems();

            // 追加ボタンがクリックされたら追加で表示
            $loadMoreButton.on('click', addItems);

            // フィルターのラジオボタンが変更されたらフィルタリングを実行
            $filter.on('change', 'input[type="radio"]', filterItems);
        }

        // アイテムを生成しドキュメントに挿入する関数
        function addItems (filter) {
            var elements = [],
                // 追加するデータの配列
                slicedData = filteredData.slice(added, added + addItemCount);

            // slicedData の要素ごとに DOM 要素を生成
            $.each(slicedData, function (i, item) {
                var itemHTML =
                    '<li class="works-item is-loading">' +
                        '<a href="' + item.images.large + '">' +
                            '<img src="' + item.images.thumb + '" alt="' + item.title + '">' +
                            '<span class="caption">' +
                                '<span class="inner">' +
                                    '<b class="title">' + item.title + '</b>' +
                                    '<time class="date" datatime="' + item.date + '">' +
                                        item.date.replace(/-0?/g, '/') + // 正規表現で -0 または - を / へ置換 
                                    '</time>' +
                                '</span>' +
                            '</span>' +
                        '</a>' +
                    '</li>';
                elements.push($(itemHTML).get(0));
            });

            // Home の場合は配列の最後に more ボタン を挿入する
            if ($('#home').length) {
                var itemMore =
                    '<div class="works-item">' +
                        '<a href="./works.html">' +
                            '<p class="item-more">more <i class="fa-solid fa-caret-right"></i></p>' +
                        '</a>' +
                    '</div>';
                elements.push($(itemMore).get(0));
            } 

            // DOM 要素の配列をコンテナに挿入し Masonry レイアウトを実行
            $container
                .append(elements)
                .imagesLoaded(function () {
                    $(elements).removeClass('is-loading');
                    $container.masonry('appended', elements);

                    // フィルタリング時は再配置
                    if (filter) {
                        $container.masonry();
                    }
                });

            // 追加済みアイテム数の更新
            added += slicedData.length;

            // JSON データがすべて追加し終わっていたら追加ボタンを消す
            if (added < filteredData.length) {
                $loadMoreButton.show();
            } else {
                $loadMoreButton.hide();
            }
        }

        // アイテムをフィルタリングする関数
        function filterItems () {
            var key = $(this).val(), // チェックされたラジオボタンの value

                // 追加済みの Masonry アイテム
                masonryItems = $container.masonry('getItemElements');

            // Masonry アイテムを削除
            $container.masonry('remove', masonryItems);

            // フィルタリング済みアイテムのデータと追加済みアイテム数をリセット
            filteredData = [];
            added = 0;

            if (key === 'all') {
                // all がチェックされた場合、すべての JSON データを格納
                filteredData = allData;
            } else {
                // all 以外の場合、キーと一致するデータを抽出
                filteredData = $.grep(allData, function (item) {
                    return item.category === key;
                });
            }

            // アイテムを追加
            addItems(true);
        }

    });

});