let app = new Vue({
    el: '.app',
    data:{
        currentstate:{
            unopen : true,
            opend : false,
        },
        showpg: ["開獎頁面" , "中獎名單" , "獎品一覽表&編輯"],
        theshow: 0,
        countdown : 5,
        countinterval: 1000,
        countdownchiu: false,
        renewprize : false,
        modifyitem : false,
        editindex : 0,
        idall: "",
        idsingle: [],
        prize: [],
        prizelist: [],
        addprize: {
            name: "",
            amount: ""
        },
        winprizelist:[],
        lastwinprize:[]
    },
    computed:{
        
    },
    methods:{
        open(){
            if(this.idall == "")return;
            let strs;
            // 清空id array 跟 中獎名單 array
            this.idsingle.splice(0,this.idsingle.length);
            this.winprizelist.splice(0,this.winprizelist.length);
            if(this.renewprize) this.prizerenew(); //有修改過獎品清單需要重新更新獎品
            strs = this.idall.trim();
            this.idsingle = strs.split("\n"); //當看到空白分割字串
            // let idsingle1 = this.idsingle.filter((element, index, arr)=>{
            //     return arr.indexOf(element) === index;
            // })
            // for(let i=0;i<idsingle1.length;i++){
            //     for(let j=0;j<this.idsingle.length;j++){
            //         if(idsingle1[i]==this.idsingle[j]){
            //             console.log(idsingle1[i]);
            //         }
            //     }
            // }
            for(let i=0; i<this.prize.length;i++){
                let randomid = Math.floor(Math.random()*this.idsingle.length);
                this.winprizelist.push({
                    winnerid : this.idsingle[randomid],
                    wonprize : this.prize[i]
                })
                this.idsingle.splice(randomid, 1);
            }
            // this.lastwinprize.splice(0,this.lastwinprize.length);
            // console.log(this.lastwinprize);
            for(let i=0;i<this.lastwinprize.length;i++){
                let target = this.lastwinprize[i].id;
                axios.delete('http://localhost:3000/lastwinprize/' +target)
                .then((res)=>{
                    // this.lastwinprize.splice(i, 1);
                    // console.log(res);       
                })
                .catch((err)=>{
                    console.log(err);
                })
                this.lastwinprize.splice(i, 1);
                i -= 1;
            }
            for(let i=0;i<this.winprizelist.length;i++){
                axios.post('http://localhost:3000/lastwinprize', this.winprizelist[i])
                .then((res)=>{
                    this.lastwinprize.push(res.data);
                })
                .catch((err)=>{
                    console.log(err);
                })
            }
            console.log(this.lastwinprize);
            // this.lastwinprize = this.winprizelist;
            this.currentstate.unopen = false;
            this.currentstate.opend = true;
            this.countdownchiu = true;
            setTimeout(this.counttimer, this.countinterval);
        },
        clear(){
            this.idall = "";
        },
        relot(){
            this.currentstate.unopen = true;
            this.currentstate.opend = false;
        },
        switchopen(index){
            if(this.countdownchiu) return;
            this.theshow = index;
        },
        prizeadd(){
            if(!this.addprize.name || !this.addprize.amount) return;
            if(!this.modifyitem){
                for(let i=0;i<this.prizelist.length;i++){
                    if(this.addprize.name == this.prizelist[i].name){
                        let amount = parseInt(this.prizelist[i].amount);
                        amount += parseInt(this.addprize.amount);
                        this.addprize.amount = String(amount);
                        let id = this.prizelist[i].id;
                        console.log(id);
                        axios.put('http://localhost:3000/prizelist/' + id, this.addprize)
                        .then((res)=>{
                            this.prizelist[i] = res.data;
                            this.cancelhandler();
                        })
                        .catch((err)=>{
                            console.log(err);
                        })
                        // this.prizelist[i].amount = String(amount); 
                        return;
                    }
                }

                axios.post('http://localhost:3000/prizelist', this.addprize)
                .then((res)=>{
                    this.prizelist.push(res.data);
                    this.cancelhandler();
                })
                .catch((err)=>{
                    console.log(err);
                })
            }
            else{
                if(confirm('確定要修改 ?')){
                    let id = this.prizelist[this.editindex].id;
                    axios.put('http://localhost:3000/prizelist/' + id, this.addprize)
                    .then((res)=>{
                        this.prizelist[this.editindex] = res.data;
                        this.modifyitem = false;
                        this.editindex = null;
                        this.cancelhandler();
                    })
                    .catch((err)=>{
                        console.log(err);
                    })
                }
                else{
                    this.addprize.name = "";
                    this.addprize.amount = "";
                    this.modifyitem = false;
                }
            }
        },
        prizerenew(){
            this.prize.splice(0,this.prize.length);
            for(let i=0;i<this.prizelist.length;i++){
                for(let j=0;j<parseInt(this.prizelist[i].amount);j++){
                    this.prize.push(this.prizelist[i].name);
                }
            }
            this.renewprize = false;
        },
        modify(index){
            this.modifyitem = true;
            this.editindex = index;
            this.addprize.name = this.prizelist[index].name;
            this.addprize.amount = this.prizelist[index].amount;
        },
        deleteitem(index){
            let target = this.prizelist[index].id;
            if(confirm('確定刪除此項 ?')){
                axios.delete('http://localhost:3000/prizelist/' +target)
                .then((res)=>{
                    console.log(res);
                    this.prizelist.splice(index, 1);
                    this.cancelhandler();
                    this.renewprize = true;    
                })
                .catch((err)=>{
                    console.log(err);
                })
            }
        },
        cancelhandler(){
            this.addprize.name = "";
            this.addprize.amount = "";
            this.renewprize = true;
        },
        counttimer(){
            if(this.countdown != 0){
                this.countdown -= 1;
                setTimeout(this.counttimer, this.countinterval);
            }
            else{
                this.relot();
                this.countdownchiu = false;
                this.theshow = 1;
                this.countdown = 5;
            }
        }
    },
    mounted(){
        axios.get('http://localhost:3000/prizelist')
        .then((res)=>{
            this.prizelist = res.data;
            // console.log(this.prizelist);
            for(let i=0;i<this.prizelist.length;i++){
                for(let j=0;j<parseInt(this.prizelist[i].amount);j++){
                    this.prize.push(this.prizelist[i].name);
                }
            }
        })
        .catch((err)=>{
            console.log(err);
        })
        axios.get('http://localhost:3000/lastwinprize')
        .then((res)=>{
            this.lastwinprize = res.data;
            // console.log(this.lastwinprize);
        })
        .catch((err)=>{
            console.log(err);
        })
    }
})