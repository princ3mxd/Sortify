myCanvas.width=500;
myCanvas.height=300;

const n=18;
const array=[];

const stringHeight=myCanvas.height*0.40;

const socks=[];
const margin=30;
const availableWidth=myCanvas.width-margin*2;
const spacing=availableWidth/n;

const colors = ['#D35400', '#2471A3', '#F39C12',
				'#B2BABB', '#138D75', '#52BE80',
				'#BB8FCE', '#555555', '#bcf60c',
				'#fabebe', '#9a6324', '#54A1D3',
				'#aaffc3', '#808000', '#333333'];

const sockColors=[];

const tweenLength=30;

for(let i=0;i<n/2;i++){
    const t=i/(n/2-1);
    sockColors.push(colors[i]);
    sockColors.push(colors[i]);
    array.push(lerp(0.3,1,t));
    array.push(lerp(0.3,1,t));
}

for(let i=0;i<array.length;i++){
    const j=Math.floor(Math.random()*array.length);
    [array[i],array[j]]=[array[j],array[i]];
    [sockColors[i],sockColors[j]]=[sockColors[j],sockColors[i]];
}

for(let i=0;i<array.length;i++){
    const u=Math.sin(i/(array.length-1)*Math.PI);
    const x=i*spacing+spacing/2+margin;
    const y=stringHeight+u*margin*0.7;
    const height=myCanvas.height*0.4*array[i];
    socks[i]=new Sock(x,y,height,sockColors[i]);
}

const bird=new Bird(socks[0].loc,socks[1].loc,myCanvas.height*0.20);

const moves=bubbleSort(array);
moves.shift();

const ctx=myCanvas.getContext("2d");
const startTime=new Date().getTime();

animate();

function animate(){
    ctx.clearRect(0,0,myCanvas.width,myCanvas.height);

    ctx.strokeStyle="black";
    ctx.beginPath();
    ctx.moveTo(0,stringHeight-margin*0.5);
    ctx.bezierCurveTo(
        myCanvas.width/4,stringHeight+margin,
        3*myCanvas.width/4,stringHeight+margin,
        myCanvas.width,stringHeight-margin*0.5
    );
    ctx.stroke();

    let changed=false;
    for(let i=0;i<socks.length;i++){
        changed=socks[i].draw(ctx)||changed;
        Physics.update(
            socks[i].particles,socks[i].segments
        );
    }

    changed=bird.draw(ctx)||changed;
    

    if(new Date().getTime()-startTime>1000 && !changed && moves.length>0){
        const nextMove=moves.shift();
        const [i,j]=nextMove.indices;
        if(nextMove.type=="swap"){
            socks[i].moveTo(socks[j].loc,tweenLength);
            socks[j].moveTo(socks[i].loc,tweenLength);
            bird.moveTo(socks[j].loc,socks[i].loc,false,tweenLength);
            [socks[i],socks[j]]=[socks[j],socks[i]];
        }else{ // bird is moving
            bird.moveTo(socks[i].loc,socks[j].loc,true,tweenLength);
        }
    }

    requestAnimationFrame(animate);
}

function bubbleSort(array){
    const moves=[];
    let n=array.length;
    let left=1;
    do{
        var swapped=false;
        if((n-left)%2==1){
            for(let i=left;i<n;i++){
                moves.push({
                    indices:[i-1,i],
                    type:"comparison"
                });
                if(array[i-1]>array[i]){
                    swapped=true;
                    [array[i-1],array[i]]=[array[i],array[i-1]];
                    moves.push({
                        indices:[i-1,i],
                        type:"swap"
                    });
                }
            }
            n--;
        }else{
            for(let i=n-1;i>=left;i--){
                moves.push({
                    indices:[i-1,i],
                    type:"comparison"
                });
                if(array[i-1]>array[i]){
                    swapped=true;
                    [array[i-1],array[i]]=[array[i],array[i-1]];
                    moves.push({
                        indices:[i-1,i],
                        type:"swap"
                    });
                }
            }
            left++;
        }
    }while(swapped);
    return moves;
}

// UI logic for dynamic sock inputs and form handling
const defaultSockCount = 10;
const sockInputsDiv = document.getElementById('sockInputs');
const sockForm = document.getElementById('sockForm');
const sortTypeSelect = document.getElementById('sortType');

function createSockInputs(count) {
    sockInputsDiv.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 1;
        input.max = 100;
        input.value = Math.floor(Math.random() * 100) + 1;
        input.className = 'sock-input';
        input.placeholder = `Sock ${i + 1}`;
        sockInputsDiv.appendChild(input);
        sockInputsDiv.appendChild(document.createElement('br'));
    }
}

createSockInputs(defaultSockCount);

sockForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const values = Array.from(sockInputsDiv.querySelectorAll('input')).map(input => Number(input.value));
    const sortType = sortTypeSelect.value;
    startSortingVisualizer(values, sortType);
});

// Add randomize button logic
const randomizeBtn = document.getElementById('randomizeBtn');
randomizeBtn.addEventListener('click', function() {
    Array.from(sockInputsDiv.querySelectorAll('input')).forEach(input => {
        input.value = Math.floor(Math.random() * 100) + 1;
    });
});

// Sorting algorithms
function selectionSort(array) {
    const moves = [];
    let n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            moves.push({ indices: [minIdx, j], type: "comparison" });
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            moves.push({ indices: [i, minIdx], type: "swap" });
        }
    }
    return moves;
}

function linearSort(array) {
    // Linear sort = simple sort (like insertion sort for visualization)
    const moves = [];
    for (let i = 1; i < array.length; i++) {
        let j = i;
        while (j > 0 && array[j - 1] > array[j]) {
            moves.push({ indices: [j - 1, j], type: "comparison" });
            [array[j - 1], array[j]] = [array[j], array[j - 1]];
            moves.push({ indices: [j - 1, j], type: "swap" });
            j--;
        }
    }
    return moves;
}

function mergeSort(array) {
    const moves = [];
    function merge(arr, l, m, r) {
        let n1 = m - l + 1;
        let n2 = r - m;
        let L = arr.slice(l, m + 1);
        let R = arr.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            moves.push({ indices: [l + i, m + 1 + j], type: "comparison" });
            if (L[i] <= R[j]) {
                if (arr[k] !== L[i]) {
                    let srcIdx = arr.indexOf(L[i], l); // find the index of L[i] in arr
                    moves.push({ indices: [k, srcIdx], type: "swap" });
                    [arr[k], arr[srcIdx]] = [arr[srcIdx], arr[k]];
                }
                arr[k++] = L[i++];
            } else {
                if (arr[k] !== R[j]) {
                    let srcIdx = arr.indexOf(R[j], m + 1); // find the index of R[j] in arr
                    moves.push({ indices: [k, srcIdx], type: "swap" });
                    [arr[k], arr[srcIdx]] = [arr[srcIdx], arr[k]];
                }
                arr[k++] = R[j++];
            }
        }
        while (i < n1) {
            if (arr[k] !== L[i]) {
                let srcIdx = arr.indexOf(L[i], l);
                moves.push({ indices: [k, srcIdx], type: "swap" });
                [arr[k], arr[srcIdx]] = [arr[srcIdx], arr[k]];
            }
            arr[k++] = L[i++];
        }
        while (j < n2) {
            if (arr[k] !== R[j]) {
                let srcIdx = arr.indexOf(R[j], m + 1);
                moves.push({ indices: [k, srcIdx], type: "swap" });
                [arr[k], arr[srcIdx]] = [arr[srcIdx], arr[k]];
            }
            arr[k++] = R[j++];
        }
    }
    function mergeSortRec(arr, l, r) {
        if (l < r) {
            let m = Math.floor((l + r) / 2);
            mergeSortRec(arr, l, m);
            mergeSortRec(arr, m + 1, r);
            merge(arr, l, m, r);
        }
    }
    mergeSortRec(array, 0, array.length - 1);
    return moves;
}

function heapSort(array) {
    const moves = [];
    let n = array.length;
    function heapify(arr, n, i) {
        let largest = i;
        let l = 2 * i + 1;
        let r = 2 * i + 2;
        if (l < n) moves.push({ indices: [l, largest], type: "comparison" });
        if (r < n) moves.push({ indices: [r, largest], type: "comparison" });
        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;
        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            moves.push({ indices: [i, largest], type: "swap" });
            heapify(arr, n, largest);
        }
    }
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(array, n, i);
    for (let i = n - 1; i > 0; i--) {
        [array[0], array[i]] = [array[i], array[0]];
        moves.push({ indices: [0, i], type: "swap" });
        heapify(array, i, 0);
    }
    return moves;
}

let currentAnimationId = null;

function startSortingVisualizer(values, sortType) {
    if (currentAnimationId !== null) {
        cancelAnimationFrame(currentAnimationId);
        currentAnimationId = null;
    }
    // Make canvas fill the right panel
    myCanvas.width = Math.floor(window.innerWidth * 0.7);
    myCanvas.height = Math.floor(window.innerHeight * 0.8);
    const n = values.length;
    const array = [...values];
    const stringHeight = myCanvas.height * 0.40;
    const socks = [];
    const margin = 30;
    const availableWidth = myCanvas.width - margin * 2;
    const spacing = availableWidth / n;
    const colors = ['#D35400', '#2471A3', '#F39C12',
        '#B2BABB', '#138D75', '#52BE80',
        '#BB8FCE', '#555555', '#bcf60c',
        '#fabebe', '#9a6324', '#54A1D3',
        '#aaffc3', '#808000', '#333333'];
    const sockColors = [];
    const tweenLength = 30;
    for (let i = 0; i < n; i++) {
        sockColors.push(colors[i % colors.length]);
    }
    for (let i = 0; i < n; i++) {
        const u = Math.sin(i / (n - 1) * Math.PI);
        const x = i * spacing + spacing / 2 + margin;
        const y = stringHeight + u * margin * 0.7;
        const height = myCanvas.height * 0.4 * (array[i] / 100);
        socks[i] = new Sock(x, y, height, sockColors[i]);
    }
    const bird = new Bird(socks[0].loc, socks[1].loc, myCanvas.height * 0.20);
    let moves = [];
    if (sortType === 'bubble') {
        moves = bubbleSort([...array]);
    } else if (sortType === 'selection') {
        moves = selectionSort([...array]);
    } else if (sortType === 'linear') {
        moves = linearSort([...array]);
    } else if (sortType === 'merge') {
        moves = mergeSort([...array]);
    } else if (sortType === 'heap') {
        moves = heapSort([...array]);
    }
    moves.shift();
    const ctx = myCanvas.getContext('2d');
    const startTime = new Date().getTime();
    function animate() {
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(0, stringHeight - margin * 0.5);
        ctx.bezierCurveTo(
            myCanvas.width / 4, stringHeight + margin,
            3 * myCanvas.width / 4, stringHeight + margin,
            myCanvas.width, stringHeight - margin * 0.5
        );
        ctx.stroke();
        let changed = false;
        for (let i = 0; i < socks.length; i++) {
            changed = socks[i].draw(ctx) || changed;
            Physics.update(
                socks[i].particles, socks[i].segments
            );
        }
        changed = bird.draw(ctx) || changed;
        if (new Date().getTime() - startTime > 1000 && !changed && moves.length > 0) {
            const nextMove = moves.shift();
            const [i, j] = nextMove.indices;
            if (nextMove.type == "swap") {
                socks[i].moveTo(socks[j].loc, tweenLength);
                socks[j].moveTo(socks[i].loc, tweenLength);
                bird.moveTo(socks[j].loc, socks[i].loc, false, tweenLength);
                [socks[i], socks[j]] = [socks[j], socks[i]];
            } else { // bird is moving
                bird.moveTo(socks[i].loc, socks[j].loc, true, tweenLength);
            }
        }
        currentAnimationId = requestAnimationFrame(animate);
    }
    animate();
}