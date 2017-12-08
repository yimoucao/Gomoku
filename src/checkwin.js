
const SQUARES_IN_LINE_FOR_WIN = 5;
const DIMENSION = 15;
const NUM_HSQUARES = DIMENSION;
const NUM_VSQUARES = DIMENSION;

function rDiagonal(x, y, squares){
    var square = squares[x][y];
    var w = 0;
    const c = y;
    const r = x;
    //increment in both col and row see TABLE 1
    for (var i = r, j = c; i < NUM_VSQUARES && y < NUM_HSQUARES; i++,j++) {
        if (square === squares[i][j]) {
            w++;
        } else {
            break;
        }
    }
    
    return (w >= SQUARES_IN_LINE_FOR_WIN);
    
}

function lDiagonal(x, y, squares){
    var square = squares[x][y];
    var w = 0;
    const c = y;
    const r = x;

    // there is no need to check out of the board or wrap
    if(r === 0 && c < (SQUARES_IN_LINE_FOR_WIN - 1)) { return false; }
//      System.out.println(r + ' ' + c);
    //check diag.
    for (var i = r, j = c; i < NUM_VSQUARES && j < NUM_HSQUARES; i++,j--) {
        if (square === squares[i][j]) {
            w++;
        } else {
            break;
        }
    }
    
    return (w >= SQUARES_IN_LINE_FOR_WIN);
    
}

function rightward(x, y, squares){
    var square = squares[x][y];
    var w = 0;
    const c = y;
    const r = x;
    //we only want to increment the column and search from that col. onwards
    for (var i = c; i < NUM_HSQUARES; i++) {
        if (square === squares[r][i]) {
            w++;
        } else {
            break;
        }
    }
    
    return (w >= SQUARES_IN_LINE_FOR_WIN);
    
}

function downward(x, y, squares){
    var square = squares[x][y];
    var w = 0;
    const c = y;
    const r = x;
    for (var i = r; i < NUM_VSQUARES; i++) {
        if (square === squares[i][c]) {
            w++;
        } else {
            break;
        }
    }
    
    return (w >= SQUARES_IN_LINE_FOR_WIN);
    
}
/**
 * this checks for a win and returns if a win was detected.
 * works by scanning the board top down, when a non-empty square found it looks in all directions.
 * @return true if win detected
 * 
 */
function isWin(squares){
    var arr = squares.slice(); // copy one piece
    var newArr = [];
    while(arr.length) newArr.push(arr.splice(0, DIMENSION));

    for (var i = 0; i < NUM_VSQUARES; i++) {
        for (var j = 0; j < NUM_HSQUARES; j++) {
            if (newArr[i][j] != null) {
                if (   downward(i, j, newArr)
                    || rightward(i, j, newArr)
                    || lDiagonal(i, j, newArr)
                    || rDiagonal(i, j, newArr)
                ) {
                    return true;
                }
            } 
            
        }
    }
    return false;
}

// TODO: testWin: only test current position, [i-4,j]~[i+4,j], [i, j-4]~[i, j+4], and diagonal

export default isWin;