document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const messageElement = document.getElementById('message');

    // 使用你提供的棋盘数字状态
    let boardNumberState = [
        [0, 0, 7, 3, 5, 0, 0],
        [0, 0, 3, 5, 7, 0, 0],
        [7, 3, 5, 7, 3, 5, 7],
        [3, 5, 7, 3, 5, 7, 3],
        [5, 7, 3, 5, 7, 3, 5],
        [0, 0, 7, 3, 5, 0, 0],
        [0, 0, 3, 5, 7, 0, 0]
    ];

    // 棋盘状态，0: 无效, 1: 棋子, 2: 空位 (初始状态基于 boardNumberState)
    let boardState = boardNumberState.map(row => row.map(num => (num === 0 ? 0 : 1)));
    // 初始中心位置设置为空位
    boardState[3][3] = 2;

    let selectedPeg = null; // 当前选中的棋子

    // 初始化棋盘
    function initBoard() {
        boardElement.innerHTML = ''; // 清空棋盘
        console.log("initBoard called"); // Debug log 1: initBoard 开始

        for (let row = 0; row < boardState.length; row++) {
            for (let col = 0; col < boardState[row].length; col++) {
                const cellType = boardState[row][col];
                const cellNumber = boardNumberState[row][col]; // 获取对应的数字

                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row = row;
                cell.dataset.col = col = col;

                if (cellNumber !== 0) {
                    cell.textContent = cellNumber; // 显示数字
                } else {
                    cell.classList.add('invalid');
                }

                if (cellType === 2) {
                    cell.classList.add('empty');
                } else if (cellType === 1) {
                    const peg = document.createElement('div');
                    peg.classList.add('peg');
                    cell.appendChild(peg);
                    console.log(`initBoard: Created peg at row ${row}, col ${col}`); // Debug log 2: 创建棋子
                }

                cell.addEventListener('click', handleCellClick);
                boardElement.appendChild(cell);
            }
        }
        console.log("initBoard finished"); // Debug log 3: initBoard 结束
    }

    // 处理格子点击事件
    function handleCellClick(event) {
        console.log("handleCellClick called"); // Debug log 4: handleCellClick 开始
        const cell = event.currentTarget;
        console.log("handleCellClick: clicked cell:", cell); // Debug log 5: 点击的 cell 元素
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellType = boardState[row][col];
        console.log(`handleCellClick: row=${row}, col=${col}, cellType=${cellType}`); // Debug log 6: 行列和 cellType

        if (cellType === 1) { // 点击了棋子
            console.log("handleCellClick: cellType is 1, calling selectPeg"); // Debug log 7: cellType 判断为 1
            selectPeg(cell);
        } else if (cellType === 2) { // 点击了空位
            console.log("handleCellClick: cellType is 2, checking selectedPeg"); // Debug log 8: cellType 判断为 2
            if (selectedPeg) {
                attemptMove(row, col);
            }
        }
        console.log("handleCellClick finished"); // Debug log 9: handleCellClick 结束
    }


    // 选中棋子
    function selectPeg(cell) {
        console.log("selectPeg called with cell:", cell); // Debug Log 1: selectPeg 开始, 打印 cell
        const pegElement = cell.querySelector('.peg'); // 使用 querySelector 获取 peg 元素
        if (selectedPeg && selectedPeg.querySelector('.peg')) { // 使用 querySelector 检查和操作之前的选中棋子
            console.log("selectPeg: removing 'selected' from:", selectedPeg.querySelector('.peg')); // Debug Log 2: 移除之前的选中
            selectedPeg.querySelector('.peg').classList.remove('selected');
        } else {
            console.log("selectPeg: No previous selectedPeg or no peg found in previous selectedPeg"); // Debug Log 3: 没有之前的选中或 peg
        }
        selectedPeg = cell;
        console.log("selectPeg: selectedPeg set to:", selectedPeg); // Debug Log 4: 设置 selectedPeg

        if (selectedPeg && pegElement) { // 确保 selectedPeg 和 pegElement 都存在
            console.log("selectPeg: adding 'selected' to:", pegElement); // Debug Log 5: 添加新的选中
            pegElement.classList.add('selected'); // 现在操作的是 pegElement，应该没问题了
        } else {
            console.log("selectPeg: ERROR - cell or pegElement is undefined!", cell, selectedPeg, pegElement); // Debug Log 6: 错误信息，cell 或 pegElement 为 undefined
        }
        console.log("selectPeg finished"); // Debug Log 7: selectPeg 结束
    }


    // 尝试移动棋子 (保持不变)
    function attemptMove(targetRow, targetCol) {
        if (!selectedPeg) return;

        const startRow = parseInt(selectedPeg.dataset.row);
        const startCol = parseInt(selectedPeg.dataset.col);

        const rowDiff = Math.abs(targetRow - startRow);
        const colDiff = Math.abs(targetCol - startCol);

        if ((rowDiff === 2 && colDiff === 0) || (colDiff === 2 && rowDiff === 0)) { // 移动距离为2，直线移动
            const jumpedRow = startRow + (targetRow - startRow) / 2;
            const jumpedCol = startCol + (targetCol - startCol) / 2;

            if (boardState[jumpedRow][jumpedCol] === 1) { // 跳过位置有棋子
                if (isValidMove(startRow, startCol, targetRow, targetCol, jumpedRow, jumpedCol)) {
                    makeMove(startRow, startCol, targetRow, targetCol, jumpedRow, jumpedCol);
                }
            }
        }
    }

    // 检查移动是否合法 (保持不变)
    function isValidMove(startRow, startCol, targetRow, targetCol, jumpedRow, jumpedCol) {
        if (targetRow < 0 || targetRow >= boardState.length || targetCol < 0 || targetCol >= boardState[0].length) return false; // 越界
        if (boardState[targetRow][targetCol] !== 2) return false; // 目标位置不是空位
        if (boardState[jumpedRow][jumpedCol] !== 1) return false; // 跳过位置不是棋子
        return true; // 简单的合法性判断
    }


    // 执行移动
    function makeMove(startRow, startCol, targetRow, targetCol, jumpedRow, jumpedCol) {
        boardState[startRow][startCol] = 2; // 起始位置变为空位
        boardState[jumpedRow][jumpedCol] = 2; // 跳过位置变为空位
        boardState[targetRow][targetCol] = 1; // 目标位置变为棋子

        if (selectedPeg && selectedPeg.querySelector('.peg')) { // 确保 selectedPeg 及其 peg 存在, 使用 querySelector
            selectedPeg.querySelector('.peg').classList.remove('selected'); // 取消选中, 使用 querySelector
        } else {
            console.log("makeMove: Warning - selectedPeg or peg not found, cannot remove 'selected' class.");
        }
        selectedPeg = null;

        initBoard(); // 重新绘制棋盘
        checkWin();   // 检查是否胜利
    }

    // 检查是否胜利 (保持不变)
    function checkWin() {
        let pegCount = 0;
        for (let row = 0; row < boardState.length; row++) {
            for (let col = 0; col < boardState[row].length; col++) {
                if (boardState[row][col] === 1) {
                    pegCount++;
                }
            }
        }

        if (pegCount === 1) {
            messageElement.textContent = '恭喜你，胜利了！';
        } else {
            messageElement.textContent = ''; // 清空消息
        }
    }

    initBoard(); // 页面加载时初始化棋盘
});
