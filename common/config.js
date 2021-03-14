const fs = require('fs-extra');
const homedir = require('os').homedir();

module.exports = {
    config: class {
        constructor() {
            fs.ensureDirSync(homedir+'/.memo');
            if (fs.existsSync(homedir+'/.memo/config.json')){
                this.conf = JSON.parse(fs.readFileSync(homedir+'/.memo/config.json', 'utf8'))
            } 
            else {
                this.conf = JSON.parse(fs.readFileSync('client/config.json', 'utf8'));
            }
        }

        context(mode){
            // mode (optional): [local, rinkeby] 
            if (!mode){
                mode = this.conf['active-mode']
            }
            return this.conf['modes'][mode];
        }
        
        global(){
            return this.conf;
        }

        show(){
            console.log(this.conf);
        }

        commit(){
            fs.writeFileSync(homedir+'/.memo/config.json', JSON.stringify(this.conf,null,4));
        }
    }
}