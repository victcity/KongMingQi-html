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
        [0, 0, 5, 7, 3, 0, 0],
        [0, 0, 7, 3, 5, 0, 0]
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

                // 根据数字添加不同的背景颜色 class
                if (cellNumber === 3) {
                    cell.classList.add('cell-3');
                } else if (cellNumber === 5) {
                    cell.classList.add('cell-5');
                } else if (cellNumber === 7) {
                    cell.classList.add('cell-7');
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

    // 处理格子点击事件 (保持不变)
    function handleCellClick(event) {
        console.log("handleCellClick called");
        const cell = event.currentTarget;
        console.log("handleCellClick: clicked cell:", cell);
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellType = boardState[row][col];
        console.log(`handleCellClick: row=${row}, col=${col}, cellType=${cellType}`);

        if (cellType === 1) {
            console.log("handleCellClick: cellType is 1, calling selectPeg");
            selectPeg(cell);
        } else if (cellType === 2) {
            console.log("handleCellClick: cellType is 2, checking selectedPeg");
            if (selectedPeg) {
                attemptMove(row, col);
            }
        }
        console.log("handleCellClick finished");
    }


    // 选中棋子 (保持不变)
    function selectPeg(cell) {
        console.log("selectPeg called with cell:", cell);
        const pegElement = cell.querySelector('.peg'); // 使用 querySelector 获取 peg 元素
        if (selectedPeg && selectedPeg.querySelector('.peg')) {
            console.log("selectPeg: removing 'selected' from:", selectedPeg.querySelector('.peg'));
            selectedPeg.querySelector('.peg').classList.remove('selected');
        } else {
            console.log("selectPeg: No previous selectedPeg or no peg found in previous selectedPeg");
        }
        selectedPeg = cell;
        console.log("selectPeg: selectedPeg set to:", selectedPeg);

        if (selectedPeg && pegElement) {
            console.log("selectPeg: adding 'selected' to:", pegElement);
            pegElement.classList.add('selected');
        } else {
            console.log("selectPeg: ERROR - cell or pegElement is undefined!", cell, selectedPeg, pegElement);
        }
        console.log("selectPeg finished");
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


    // 执行移动 (保持不变)
    function makeMove(startRow, startCol, targetRow, targetCol, jumpedRow, jumpedCol) {
        boardState[startRow][startCol] = 2;
        boardState[jumpedRow][jumpedCol] = 2;
        boardState[targetRow][targetCol] = 1;

        if (selectedPeg && selectedPeg.querySelector('.peg')) {
            selectedPeg.querySelector('.peg').classList.remove('selected');
        } else {
            console.log("makeMove: Warning - selectedPeg or peg not found, cannot remove 'selected' class.");
        }
        selectedPeg = null;

        initBoard();
        checkWin();
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
            messageElement.textContent = '';
        }
    }

    initBoard(); // 页面加载时初始化棋盘
});
