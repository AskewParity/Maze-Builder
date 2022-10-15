function draw(matrix, sol) {
    var canvas = document.getElementById('maze');
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');

        let size = Math.min(800 / matrix.length, 800 / matrix[0].length);

        ctx.clearRect(0, 0, 800, 800);

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] == 0) {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(size * j, size * i, size, size);
                } else if (sol && matrix[i][j] == 2) {
                    ctx.fillStyle = "#0098DF";
                    ctx.fillRect(size * j, size * i, size, size);
                } else {
                    ctx.clearRect(size * j, size * i, size, size);
                }
            }
        }
    }
}

class algo {
    constructor(height, width) {
        this.height = height - (height % 2) - 1;
        this.width = width - (width % 2) - 1;
        this.mat = this.create_grid();
    }

    create_grid() {
        let temp = new Array(this.height);
        for (let i = 0; i < this.height; i++) {
            temp[i] = new Array(this.width);
            for (let j = 0; j < this.width; j++) {
                temp[i][j] = 0;
            }
        }
        return temp
    }

    neighbor(x, y) {
        const dir = [[-2, 0, 2, 0], [0, -2, 0, 2]];
        let arr = [];
        for (let i = 0; i < 4; i++) {
            let nx = x + dir[0][i];
            let ny = y + dir[1][i];
            if (nx >= 0 && nx < this.height && ny >= 0 && ny < this.width) {
                 if (this.mat[nx][ny] == 0) {
                    arr.push({
                        x: nx,
                        y: ny
                    });
                }
            }
        }
        return arr;
    }

    maze_gen() {
        const dir = [[-1, 0, 1, 0], [0, -1, 0, 1]];
        let stack = [];
        stack.push({
            x: this.height - 1,
            y: 0
        });

        while (stack.length != 0) {
            const current_cell = stack.pop();
            this.mat[current_cell.x][current_cell.y] = 1;
            //Neighbors
            let neighbors = this.neighbor(current_cell.x, current_cell.y);
            if(neighbors.length > 0) {
                let new_cell = neighbors[Math.floor(Math.random() * neighbors.length)]
                this.mat[new_cell.x][new_cell.y] = 1;
                this.mat[(current_cell.x + new_cell.x) / 2][(current_cell.y + new_cell.y) / 2] = 1;
                stack.push(current_cell);
                stack.push(new_cell);
            }
        }

        //CREATES NEW MAT
        let m = new Array(this.mat.length + 2);
        for (let i = 0; i < m.length; i++) {
            m[i] = new Array(this.mat[0].length + 2);
            for (let j = 0; j < m[i].length; j++) {
                if (i == 0 || i == m.length - 1 || j == 0 || j == m[i].length - 1) {
                    m[i][j] = 0;
                } else {
                    m[i][j] = this.mat[i - 1][j - 1];
                }
            }
        }

        //HOLES AT THE START AND END
        m[m.length - 2][0] = 1;
        let start = 1;
        for (let i = 0; i < m.length; i++) {
            if (m[i][m[i].length - 2] == 1) {
                m[i][m[i].length - 1] = 1;
                start = i;
                break;
            }
        }

        let solution = [];
        let visited = [];

        solution.push({
            x: m.length - 2,
            y: 0
        });


        function check_sol(nx, ny) {
            if (nx == start && ny == m[nx].length - 1) {
                return 2;
            }
            if (nx < 0 || nx >= m.length || ny < 0 || ny >= m[0].length)
                return -1;

            if (visited.some(value =>
                value.x == nx && value.y == ny
            )) {
                return -1;
            }
            if (m[nx][ny] == 1)
                return 1;
            return -1;
        }

        outer: while (solution.length != 0) {
            let curr = solution.pop();
            visited.push({
                x: curr.x,
                y: curr.y
            });
            for (let i = 0; i < 4; i++) {
                let outcome = check_sol(curr.x + dir[0][i], curr.y + dir[1][i]);

                if (outcome == 2) {
                    solution.push(curr);
                    solution.push({
                        x: start,
                        y: m[0].length - 1
                    });
                    break outer;
                } else if (outcome == 1) {
                    solution.push(curr);
                    solution.push({
                        x: curr.x + dir[0][i],
                        y: curr.y + dir[1][i]
                    });
                    break;
                }
            }
        }

        solution.forEach(Element => {
            m[Element.x][Element.y] = 2;
        })

        return m;
    }
}

var m = new algo(10, 10).maze_gen();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('maze-submit').addEventListener('click', () => {
        setup();
    });

    document.getElementById('show-sol').addEventListener('click', () => {
        show_sol();
    });
});



let s_sol = false;
function show_sol() {
    s_sol = !s_sol;
    draw(m, s_sol);
}

function setup() {
    s_sol = false;
    let maze = new algo(3, 3);
    if (!Number.isNaN(document.getElementById('heightI').value) && !Number.isNaN(document.getElementById('widthI').value)) {
        let tempHeight = 5;
        let tempWidth = 5;
        if(document.getElementById('heightI').value > 5) {
            tempHeight = document.getElementById('heightI').value;
        }
        if(document.getElementById('widthI').value > 5) {
            tempWidth = document.getElementById('widthI').value;
        }
        maze = new algo(tempHeight, tempWidth);
    }

    m = maze.maze_gen();

    draw(m, false);
}