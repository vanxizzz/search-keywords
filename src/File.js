const fsPromise = require("fs").promises;
const path = require("path");
const pAll = require("p-all")
let num = 0;
class File {
    constructor(filename, name, ext, isFile, size, createTime, updateTime) {
        this.filename = filename;
        this.name = name;
        this.ext = ext;
        this.isFile = isFile;
        this.size = size;
        this.createTime = createTime;
        this.updateTime = updateTime;
    }
    async getContent(isBuffer = false, type = "utf-8") {
        if (!this.isFile) {
            return null;
        }
        let data = await fsPromise.readFile(this.filename);
        if (!isBuffer) {
            data = data.toString(type);
        };
        return data;
    }
    async getChildren() {
        num++;
        let childrenArr = [];
        if (!this.isFile) {
            const files = await fsPromise.readdir(this.filename);
            let proAll = files.map(it => {
                return () => File.create(path.resolve(this.filename, it))
            })
            childrenArr = await pAll(proAll, { concurrency: 300 });
        };
        // console.log(`嘀嘀嘀${num}次`)
        return childrenArr;
    }
    static async create(filename) {
        const stat = await fsPromise.stat(filename);
        const isFile = stat.isFile();
        const ext = path.extname(filename);
        const name = path.basename(filename);
        const size = stat.size;
        const createTime = new Date(stat.birthtime);
        const updateTime = new Date(stat.mtime);
        let newFile = new File(filename, name, ext, isFile, size, createTime, updateTime);
        return newFile;
    }
};

module.exports = File;