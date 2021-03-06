/*
京喜财富岛 原作者smiek2221
活动地址: 京喜APP-我的-京喜财富岛
活动时间：长期
更新时间：2021-07-13 12:00
脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
=================================Quantumultx=========================
[task_local]
#京喜财富岛
10 3-20/1 * * * https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jd_cfd_new.js, tag=京喜财富岛, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
=================================Loon===================================
[Script]
cron "10 3-20/1 * * *" script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jd_cfd_new.js,tag=京喜财富岛
===================================Surge================================
京喜财富岛 = type=cron,cronexp="10 3-20/1 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jd_cfd_new.js
====================================小火箭=============================
京喜财富岛 = type=cron,script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jd_cfd_new.js, cronexpr="10 3-20/1 * * *", timeout=3600, enable=true
 */
const $ = new Env('财富大陆');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
$.appId = 10032;
const UA = `jdpingou;iPhone;4.11.0;${Math.ceil(Math.random()*2+12)}.${Math.ceil(Math.random()*4)};${randomString(40)};`
function randomString(e) {
    e = e || 32;
    let t = "abcdefhijkmnprstwxyz2345678", a = t.length, n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}
$.InviteList = []

let cookiesArr = [], cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}



!(async () => {
    if (!cookiesArr[0]) {
        $.msg('【京东账号一】宠汪汪积分兑换奖品失败', '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    }
    console.log(`\n
想要我的财富吗
我把它放在一个神奇的岛屿
去找吧
`)
    await requestAlgo();
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            $.cookie = cookiesArr[i] + '';
            $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            console.log(`\n*****开始【京东账号${$.index}】${$.UserName}****\n`);
            await run();
        }
    }
    // 助力
    for (let i = 0; i < cookiesArr.length; i++) {
        $.cookie = cookiesArr[i];
        $.canHelp = true;
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        $.index = i + 1;
        if ($.InviteList && $.InviteList.length) console.log(`\n******开始【邀请好友助力】*********\n`);
        for (let j = 0; j < $.InviteList.length && $.canHelp; j++) {
            $.inviteId = $.InviteList[j];
            console.log(`${$.UserName} 助力 ${$.inviteId}`);
            let res = await taskGet(`story/helpbystage`, '_cfd_t,bizCode,dwEnv,ptag,source,strShareId,strZone', `&strShareId=${$.inviteId}`)
            if(res && res.iRet == 0){
                console.log(`助力成功: 获得${res.Data && res.Data.GuestPrizeInfo && res.Data.GuestPrizeInfo.strPrizeName || ''}`)
            }else if(res && res.sErrMsg){
                console.log(res.sErrMsg)
                if(res.sErrMsg.indexOf('助力次数达到上限') > -1 || res.iRet === 2232 || res.sErrMsg.indexOf('助力失败') > -1){
                    break
                }
            }else{
                console.log(JSON.stringify(res))
            }
            await $.wait(1000);
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    }).finally(() => {
        $.done();
    })
async function run() {
    try{
        $.HomeInfo = ''
        $.LeadInfo = ''
        $.buildList = ''
        $.Fund = ''
        $.task = []
        $.Biztask = []
        $.Aggrtask = []
        $.Employtask = []

        await GetHomePageInfo()

        if($.HomeInfo){
            $.InviteList.push($.HomeInfo.strMyShareId)
            console.log(`等级:${$.HomeInfo.dwLandLvl} 当前金币:${$.HomeInfo.ddwCoinBalance} 当前财富:${$.HomeInfo.ddwRichBalance} 助力码:${$.HomeInfo.strMyShareId}`)
        }
        if($.LeadInfo && $.LeadInfo.dwLeadType == 2){
            await $.wait(2000)
            console.log(`\n新手引导`)
            await noviceTask()
            await GetHomePageInfo()
            await $.wait(1000)
        }
        // 故事会
        await StoryInfo()
        // 建筑升级
        await buildList()
        // 签到 邀请奖励
        await sign()
        // 捡垃圾
        await pickshell(1)
        // 倒垃圾
        await RubbishOper()
        // 导游
        await Guide()
        // 撸珍珠
        await Pearl()
        // 牛牛任务
        await ActTask()
        // 日常任务、成就任务
        await UserTask()

    }
    catch (e) {
        console.log(e);
    }
}
async function GetHomePageInfo() {
    let additional= `&ddwTaskId&strShareId&strMarkList=guider_step%2Ccollect_coin_auth%2Cguider_medal%2Cguider_over_flag%2Cbuild_food_full%2Cbuild_sea_full%2Cbuild_shop_full%2Cbuild_fun_full%2Cmedal_guider_show%2Cguide_guider_show%2Cguide_receive_vistor`
    let stk= `_cfd_t,bizCode,ddwTaskId,dwEnv,ptag,source,strMarkList,strShareId,strZone`
    $.HomeInfo = await taskGet(`user/QueryUserInfo`, stk, additional)
    if($.HomeInfo){
        $.Fund = $.HomeInfo.Fund || ''
        $.LeadInfo = $.HomeInfo.LeadInfo || ''
        $.buildInfo = $.HomeInfo.buildInfo || ''
        if($.buildInfo.buildList){
            $.buildList = $.buildInfo.buildList || ''
        }
    }
}
// 故事会
async function StoryInfo(){
    try{
        if($.HomeInfo.StoryInfo && $.HomeInfo.StoryInfo.StoryList){
            let additional = ``
            let stk = ``
            let type = ``
            let res = ``
            await $.wait(1000)
            // 点击故事
            if($.HomeInfo.StoryInfo.StoryList[0].dwStatus == 1){
                if($.HomeInfo.StoryInfo.StoryList[0].dwType == 4){
                    console.log(`\n贩卖`)
                    additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=2&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
                    stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`
                    type = `CollectorOper`
                    res = await taskGet(`story/${type}`, stk, additional)
                    // console.log(JSON.stringify(res))
                }else if($.HomeInfo.StoryInfo.StoryList[0].dwType == 1){
                    console.log(`\n故事会[${$.HomeInfo.StoryInfo.StoryList[0].Special.strName}]`)
                    additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=2&triggerType=${$.HomeInfo.StoryInfo.StoryList[0].Special.dwTriggerType}&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
                    stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`
                    type = `SpecialUserOper`
                    res = await taskGet(`story/${type}`, stk, additional)
                    // console.log(JSON.stringify(res))
                }else if($.HomeInfo.StoryInfo.StoryList[0].dwType == 2){
                    console.log(`\n美人鱼`)
                    additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=1&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
                    stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`
                    type = `MermaidOper`
                    res = await taskGet(`story/${type}`, stk, additional)
                    console.log(JSON.stringify(res))
                }
            }
            if($.HomeInfo.StoryInfo.StoryList[0].dwType == 4 && ( (res && res.iRet == 0) || res == '')){
                await pickshell(4)
                await $.wait(1000)
                console.log(`查询背包`)
                additional = `&ptag=`
                stk = `_cfd_t,bizCode,dwEnv,ptag,source,strZone`
                res = await taskGet(`story/querystorageroom`, stk, additional)
                let TypeCnt = []
                if(res.Data && res.Data.Office){
                    for(let i of res.Data.Office){
                        TypeCnt.push(`${i.dwType}:${i.dwCount}`)
                    }
                }
                TypeCnt = TypeCnt.join(`|`)
                if(TypeCnt){
                    console.log(`出售`)
                    await $.wait(1000)
                    additional = `&ptag=&strTypeCnt=${TypeCnt}&dwSceneId=1`
                    stk = `_cfd_t,bizCode,dwEnv,dwSceneId,ptag,source,strTypeCnt,strZone`
                    res = await taskGet(`story/sellgoods`, stk, additional)
                    await printRes(res, '贩卖')
                }
            }else if($.HomeInfo.StoryInfo.StoryList[0].dwType == 1 && ( (res && res.iRet == 0) || res == '')){
                if(res && res.iRet == 0 && res.Data && res.Data.Serve && res.Data.Serve.dwWaitTime){
                    console.log(`等待 ${res.Data.Serve.dwWaitTime}秒`)
                    await $.wait(res.Data.Serve.dwWaitTime * 1000)
                    await $.wait(1000)
                }
                additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=3&triggerType=${$.HomeInfo.StoryInfo.StoryList[0].Special.dwTriggerType}&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
                stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`
                type = `SpecialUserOper`
                res = await taskGet(`story/${type}`, stk, additional)
                await printRes(res, `故事会[${$.HomeInfo.StoryInfo.StoryList[0].Special.strName}]`)
                // console.log(JSON.stringify(res))

            }else if($.HomeInfo.StoryInfo.StoryList[0].dwType == 2 && ( (res && res.iRet == 0) || res == '')){
                if($.HomeInfo.StoryInfo.StoryList[0].dwStatus == 4){
                    additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=4&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
                }else{
                    additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=2&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
                }
                await $.wait(5000)
                stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`
                type = `MermaidOper`
                res = await taskGet(`story/${type}`, stk, additional)
                await printRes(res,'美人鱼')
                // console.log(JSON.stringify(res))
            }
        }
    }catch (e) {
        $.logErr(e);
    }
}
// 建筑升级
async function buildList(){
    try{
        await $.wait(2000)
        console.log(`\n升级房屋、收集金币`)
        if($.buildList){
            for(let i in $.buildList){
                let item = $.buildList[i]
                let title = '未识别'
                if(item.strBuildIndex == 'food'){
                    title = '美食城'
                }else if(item.strBuildIndex == 'sea'){
                    title = '旅馆'
                }else if(item.strBuildIndex == 'shop'){
                    title = '商店'
                }else if(item.strBuildIndex == 'fun'){
                    title = '游乐场'
                }
                let additional = `&strBuildIndex=${item.strBuildIndex}`
                let stk= `_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone`
                let GetBuildInfo = await taskGet(`user/GetBuildInfo`, stk, additional)
                let msg = `[${title}] 当前等级:${item.dwLvl} 接待收入:${item.ddwOneceVistorAddCoin}/人 座位人数:${item.dwContain}`
                if(GetBuildInfo) msg += ` 升级->需要金币:${GetBuildInfo.ddwNextLvlCostCoin} 获得财富:${GetBuildInfo.ddwLvlRich}`
                console.log(msg)
                await $.wait(1000)
                if(GetBuildInfo.dwCanLvlUp > 0){
                    console.log(`${item.dwLvl == 0 && '开启' || '升级'}${title}`)
                    if(item.dwLvl == 0){
                        await taskGet(`user/createbuilding`, stk, additional)
                    }else{
                        if(GetBuildInfo){
                            additional = `&strBuildIndex=${GetBuildInfo.strBuildIndex}&ddwCostCoin=${GetBuildInfo.ddwNextLvlCostCoin}`
                            stk = `_cfd_t,bizCode,ddwCostCoin,dwEnv,ptag,source,strBuildIndex,strZone`
                            let update = await taskGet(`user/BuildLvlUp`, stk, additional)
                            if(update && update.story && update.story.strToken){
                                await $.wait(Number(update.story.dwWaitTriTime) * 1000)
                                await $.wait(1000)
                                additional= `&strToken=${update.story.strToken}&ddwTriTime=${update.story.ddwTriTime}`
                                stk = `_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone`
                                // await taskGet(`story/QueryUserStory`, stk, additional)
                            }
                        }
                    }
                    await $.wait(2000)
                }
                additional = `&strBuildIndex=${GetBuildInfo.strBuildIndex}&dwType=1`
                stk = `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strBuildIndex,strZone`
                let CollectCoin = await taskGet(`user/CollectCoin`, stk, additional)
                if(CollectCoin && CollectCoin.ddwCoinBalance){
                    console.log(`收集金币:${CollectCoin.ddwCoin} 当前剩余:${CollectCoin.ddwCoinBalance}`)
                    await $.wait(Number(CollectCoin.story.dwWaitTriTime) * 1000)
                    additional= `&strToken=${CollectCoin.story.strToken}&ddwTriTime=${CollectCoin.story.ddwTriTime}`
                    stk = `_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone`
                    // await taskGet(`story/QueryUserStory`, stk, additional)
                }
                await $.wait(1000)
            }
            await GetHomePageInfo()
            await $.wait(1000)
        }
        if($.Fund && $.Fund.dwIsGetGift < $.Fund.dwIsShowFund){
            console.log(`\n领取开拓基金${Number($.Fund.strGiftName)}元`)
            let additional= ``
            let stk= `_cfd_t,bizCode,dwEnv,ptag,source,strZone`
            let drawpackprize = await taskGet(`user/drawpackprize`, stk, additional)
        }

    }catch (e) {
        $.logErr(e);
    }
}
// 签到 邀请奖励
async function sign(){
    try{
        // 签到
        await $.wait(2000)
        $.Aggrtask = await taskGet(`story/GetTakeAggrPage`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
        if($.Aggrtask && $.Aggrtask.Data && $.Aggrtask.Data.Sign){
            if($.Aggrtask.Data.Sign.dwTodayStatus == 0) {
                console.log('\n签到')
                let flag = false
                let ddwCoin = 0
                let ddwMoney = 0
                let dwPrizeType = 0
                let strPrizePool = 0
                let dwPrizeLv = 0
                for(i of $.Aggrtask.Data.Sign.SignList){
                    if(i.dwStatus == 0){
                        flag = true
                        ddwCoin = i.ddwCoin || 0
                        ddwMoney = i.ddwMoney || 0
                        dwPrizeType = i.dwPrizeType || 0
                        strPrizePool = i.strPrizePool || 0
                        dwPrizeLv = i.dwBingoLevel || 0
                        break;
                    }
                }
                if(flag){
                    let additional = `&ptag=&ddwCoin=${ddwCoin}&ddwMoney=${ddwMoney}&dwPrizeType=${dwPrizeType}&strPrizePool${strPrizePool && '='+strPrizePool ||''}&dwPrizeLv=${dwPrizeLv}`
                    let stk= `_cfd_t,bizCode,ddwCoin,ddwMoney,dwEnv,dwPrizeLv,dwPrizeType,ptag,source,strPrizePool,strZone`
                    let res = await taskGet(`story/RewardSign`, stk, additional)
                    await printRes(res, '签到')
                }
            }
        }
        if($.Aggrtask && $.Aggrtask.Data && $.Aggrtask.Data.Employee && $.Aggrtask.Data.Employee.EmployeeList){
            console.log(`\n领取邀请奖励`)
            for(let i of $.Aggrtask.Data.Employee.EmployeeList){
                if(i.dwStatus == 0){
                    let res = await taskGet(`story/helpdraw`, '_cfd_t,bizCode,dwEnv,dwUserId,ptag,source,strZone', `&ptag=&dwUserId=${i.dwId}`)
                    await printRes(res, '邀请奖励')
                }
            }
        }
    }catch (e) {
        $.logErr(e);
    }
}
// 捡垃圾
async function pickshell(num = 1){
    return new Promise(async (resolve) => {
        try{
            console.log(`\n捡垃圾`)
            // pickshell dwType 1珍珠 2海螺 3大海螺  4海星
            for(i=1;num--;i++){
                await $.wait(2000)
                $.queryshell = await taskGet(`story/queryshell`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', `&ptag=`)
                let c = 4
                for(i=1;c--;i++){
                    let o = 1
                    let name = '珍珠'
                    if(i == 2) name = '海螺'
                    if(i == 3) name = '大海螺'
                    if(i == 4) name = '海星'
                    do{
                        console.log(`去捡${name}第${o}次`)
                        o++;
                        let res = await taskGet(`story/pickshell`, '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strZone', `&ptag=&dwType=${i}`)
                        await $.wait(200)
                        if(res.iRet != 0){
                            break
                        }
                    }while (o < 20)
                }
            }
        }catch (e) {
            $.logErr(e);
        }
        finally {
            resolve();
        }
    })
}
// 倒垃圾
async function RubbishOper(){
    try{
        // 倒垃圾
        await $.wait(2000)
        $.QueryRubbishInfo = await taskGet(`story/QueryRubbishInfo`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
        if($.QueryRubbishInfo && $.QueryRubbishInfo.Data && $.QueryRubbishInfo.Data.StoryInfo.StoryList){
            for(let i of $.QueryRubbishInfo.Data.StoryInfo.StoryList){
                let res = ''
                if(i.strStoryId == 3){
                    console.log(`\n倒垃圾`)
                    $.RubbishOper = await taskGet(`story/RubbishOper`, '_cfd_t,bizCode,dwEnv,dwRewardType,dwType,ptag,source,strZone', '&ptag=&dwType=1&dwRewardType=0')
                    if($.RubbishOper && $.RubbishOper.Data && $.RubbishOper.Data.ThrowRubbish && $.RubbishOper.Data.ThrowRubbish.Game && $.RubbishOper.Data.ThrowRubbish.Game.RubbishList){
                        for(let j of $.RubbishOper.Data.ThrowRubbish.Game.RubbishList){
                            console.log(`放置[${j.strName}]等待任务完成`)
                            res = await taskGet(`story/RubbishOper`, '_cfd_t,bizCode,dwEnv,dwRewardType,dwRubbishId,dwType,ptag,source,strZone', `&ptag=&dwType=2&dwRewardType=0&dwRubbishId=${j.dwId}`)
                            await $.wait(2000)
                        }
                        if(res && res.Data && res.Data.RubbishGame && res.Data.RubbishGame.AllRubbish && res.Data.RubbishGame.AllRubbish.dwIsGameOver && res.Data.RubbishGame.AllRubbish.dwIsGameOver == 1){
                            console.log(`任务完成获得:${res.Data.RubbishGame.AllRubbish.ddwCoin && res.Data.RubbishGame.AllRubbish.ddwCoin+'金币' || ''}`)
                        }else{
                            console.log(JSON.stringify(res))
                        }
                    }
                }
            }
        }
    }catch (e) {
        $.logErr(e);
    }
}
// 雇佣导游
async function Guide(){
    try{
        await $.wait(2000)
        $.Employtask = await taskGet(`user/EmployTourGuideInfo`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
        if($.Employtask && $.Employtask.TourGuideList){
            console.log(`\n雇佣导游`)
            let num = $.Employtask.dwRemainGuideCnt
            console.log(`当前可雇佣劳动人数:${num}`)
            let arr = [];
            for(let i in $.Employtask.TourGuideList){
                let item = $.Employtask.TourGuideList[i]
                let larr = [],res = true
                arr.forEach((x)=>{
                    if(x.ddwProductCoin < item.ddwProductCoin && res == true){
                        larr.push(item)
                        res = false
                    }
                    larr.push(x)
                })
                if(res) larr.push(item)
                arr = larr
            }
            for(let i of arr){
                console.log(`${i.strGuideName} 收益:${i.ddwProductCoin} 支付成本:${i.ddwCostCoin} 剩余工作时长:${timeFn(Number(i.ddwRemainTm || 0) * 1000)}`)
                let dwIsFree = 0
                let ddwConsumeCoin = i.ddwCostCoin
                if(i.dwFreeMin != 0) dwIsFree = 1
                if(num > 0 && i.ddwRemainTm == 0){
                    res = await taskGet(`user/EmployTourGuide`, '_cfd_t,bizCode,ddwConsumeCoin,dwEnv,dwIsFree,ptag,source,strBuildIndex,strZone', `&ptag=&strBuildIndex=${i.strBuildIndex}&dwIsFree=${dwIsFree}&ddwConsumeCoin=${ddwConsumeCoin}`)
                    if(res.iRet == 0){
                        console.log(`雇佣成功`)
                        num--;
                    }else{
                        console.log(`雇佣失败:`, JSON.stringify(res))
                    }
                    await $.wait(3000)
                }
            }
        }

    }catch (e) {
        $.logErr(e);
    }
}
// 撸珍珠
async function Pearl(){
    try{
        await $.wait(2000)
        $.ComposeGameState = await taskGet(`user/ComposeGameState`, '', '')
        console.log(`\n当前有${$.ComposeGameState.dwCurProgress}颗珍珠`)
        if ($.ComposeGameState.dwCurProgress < 8 && $.ComposeGameState.strDT) {
            let b = 1
            console.log(`合珍珠${b}次 `)
            // b = 8-$.ComposeGameState.dwCurProgress
            for(i=1;b--;i++){
                let n = Math.ceil(Math.random()*12+12)
                console.log(`上报次数${n}`)
                for(m=1;n--;m++){
                    console.log(`上报第${m}次`)
                    await $.wait(5000)
                    await taskGet(`user/RealTmReport`, '', `&dwIdentityType=0&strBussKey=composegame&strMyShareId=${$.ComposeGameState.strMyShareId}&ddwCount=5`)
                }
                console.log("合成珍珠")
                let res = await taskGet(`user/ComposeGameAddProcess`, '__t,strBT,strZone', `&strBT=${$.ComposeGameState.strDT}`)
                if(res && res.iRet == 0){
                    console.log(`合成成功:当前有${res.dwCurProgress}颗`)
                }else{
                    console.log(JSON.stringify(res))
                }
                $.ComposeGameState = await taskGet(`user/ComposeGameState`, '', '')
            }
        }
        for (let i of $.ComposeGameState.stagelist) {
            if (i.dwIsAward == 0 && $.ComposeGameState.dwCurProgress >= i.dwCurStageEndCnt) {
                await $.wait(2000)
                let res = await taskGet(`user/ComposeGameAward`, '__t,dwCurStageEndCnt,strZone', `&dwCurStageEndCnt=${i.dwCurStageEndCnt}`)
                await printRes(res,'珍珠领奖')
            }
        }
    }catch (e) {
        $.logErr(e);
    }
}
// 牛牛任务
async function ActTask(){
    try{
        let res = ''
        await $.wait(2000)
        $.Biztask = await taskGet(`story/GetActTask`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
        if($.Biztask && $.Biztask.Data && $.Biztask.Data.dwStatus != 4){
            console.log(`\n牛牛任务`)
            if($.Biztask.Data.dwStatus == 3 && $.Biztask.Data.dwTotalTaskNum && $.Biztask.Data.dwCompleteTaskNum && $.Biztask.Data.dwTotalTaskNum == $.Biztask.Data.dwCompleteTaskNum){
                res = await taskGet(`story/ActTaskAward`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', `&ptag=`)
                if(res.iRet == 0){
                    console.log(`领取全部任务奖励:`, res.Data.ddwBigReward || '')
                }else{
                    console.log(`领取全部任务奖励失败:`, JSON.stringify(res))
                }
            }
            for(let i in $.Biztask.Data.TaskList){
                let item = $.Biztask.Data.TaskList[i]
                if(item.dwAwardStatus != 2 && item.dwCompleteNum === item.dwTargetNum) continue
                console.log(`去做任务 ${item.strTaskName},${item.dwAwardStatus},${item.dwOrderId},${item.dwCompleteNum},${item.dwTargetNum}`)
                if (item.dwAwardStatus == 2 && item.dwCompleteNum === item.dwTargetNum) {
                    res = await taskGet(`Award1`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.ddwTaskId}`)
                    if(res.ret == 0){
                        if(res.data.prizeInfo){
                            res.data.prizeInfo = $.toObj(res.data.prizeInfo)
                        }
                        if(res.data.prizeInfo.ddwCoin || res.data.prizeInfo.ddwMoney){
                            console.log(`${item.taskName} 领取奖励:${res.data.prizeInfo.ddwCoin && res.data.prizeInfo.ddwCoin+'金币' || ''} ${res.data.prizeInfo.ddwMoney && res.data.prizeInfo.ddwMoney+'财富' || ''}`)
                        }else{
                            console.log(`${item.taskName} 领取奖励:`, JSON.stringify(res))
                        }
                    }else{
                        console.log(`${item.strTaskName} 领取奖励失败:`, JSON.stringify(res))
                    }
                    await $.wait(1000)
                }
                if(item.dwAwardStatus == 2 && item.dwCompleteNum < item.dwTargetNum && [2].includes(item.dwOrderId)){
                    if(item.dwOrderId == 2){
                        let b = (item.dwTargetNum-item.dwCompleteNum)
                        let arr = ['food','sea','shop','fun']
                        for(i=1;b--;i++){
                            let strBuildIndex = arr[Math.floor((Math.random()*arr.length))]
                            console.log(`第${i}/${b+i}次:${strBuildIndex}`)
                            let res = await taskGet(`user/SpeedUp`, '_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone', `&ptag=&strBuildIndex=fun`)
                            if(res && res.iRet == 0){
                                additional= `&strToken=${res.story.strToken}&ddwTriTime=${res.story.ddwTriTime}`
                                stk = `_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone`
                                // await taskGet(`story/QueryUserStory`, stk, additional)
                                await $.wait(1000)
                            }
                        }
                        res = await taskGet(`Award1`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.ddwTaskId}`)
                        if(res.ret == 0){
                            if(res.data.prizeInfo){
                                res.data.prizeInfo = $.toObj(res.data.prizeInfo)
                            }
                            if(res.data.prizeInfo.ddwCoin || res.data.prizeInfo.ddwMoney){
                                console.log(`${item.taskName} 领取奖励:${res.data.prizeInfo.ddwCoin && res.data.prizeInfo.ddwCoin+'金币' || ''} ${res.data.prizeInfo.ddwMoney && res.data.prizeInfo.ddwMoney+'财富' || ''}`)
                            }else{
                                console.log(`${item.taskName} 领取奖励:`, JSON.stringify(res))
                            }
                        }else{
                            console.log(`${item.strTaskName} 领取奖励失败:`, JSON.stringify(res))
                        }
                        await $.wait(1000)
                    }
                }
            }
        }

    }catch (e) {
        $.logErr(e);
    }
}
// 日常任务、成就任务
async function UserTask(){
    try{
        await $.wait(2000)
        let res = ''
        $.task = await taskGet(`GetUserTaskStatusList`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', '&ptag=&taskId=0')
        if($.task && $.task.data && $.task.data.userTaskStatusList){
            console.log(`\n日常任务、成就任务`)
            for(let i in $.task.data.userTaskStatusList){
                let item = $.task.data.userTaskStatusList[i]
                if(item.awardStatus != 2 && item.completedTimes === item.targetTimes) continue
                console.log(`任务 ${item.taskName} (${item.completedTimes}/${item.targetTimes})`)
                if (item.awardStatus == 2 && item.completedTimes === item.targetTimes) {
                    res = await taskGet(`Award`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.taskId}`)
                    console.log(JSON.stringify(res))
                    if(res.ret == 0){
                        if(res.data.prizeInfo){
                            res.data.prizeInfo = $.toObj(res.data.prizeInfo)
                        }
                        if(res.data.prizeInfo.ddwCoin || res.data.prizeInfo.ddwMoney){
                            console.log(`${item.taskName} 领取奖励:${res.data.prizeInfo.ddwCoin && res.data.prizeInfo.ddwCoin+'金币' || ''} ${res.data.prizeInfo.ddwMoney && res.data.prizeInfo.ddwMoney+'财富' || ''}`)
                        }else{
                            console.log(`${item.taskName} 领取奖励:`, JSON.stringify(res))
                        }
                    }else{
                        console.log(`${item.taskName} 领取奖励失败:`, JSON.stringify(res))
                    }
                    await $.wait(1000)
                }
                if(item.dateType == 2){
                    if(item.awardStatus === 2 && item.completedTimes < item.targetTimes && [1,2,3,4].includes(item.orderId)){
                        if(item.taskName.indexOf('捡贝壳') >-1 || item.taskName.indexOf('赚京币任务') >-1) continue
                        let b = (item.targetTimes-item.completedTimes)
                        for(i=1;b--;i++){
                            console.log(`第${i}次`)
                            res = await taskGet('DoTask', '_cfd_t,bizCode,configExtra,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.taskId}&configExtra=`)
                            await $.wait(5000)
                        }
                        res = await taskGet(`Award`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.taskId}`)
                        if(res.ret == 0){
                            if(res.data.prizeInfo){
                                res.data.prizeInfo = $.toObj(res.data.prizeInfo)
                            }
                            if(res.data.prizeInfo.ddwCoin || res.data.prizeInfo.ddwMoney){
                                console.log(`${item.taskName} 领取奖励:${res.data.prizeInfo.ddwCoin && res.data.prizeInfo.ddwCoin+'金币' || ''} ${res.data.prizeInfo.ddwMoney && res.data.prizeInfo.ddwMoney+'财富' || ''}`)
                            }else{
                                console.log(`${item.taskName} 领取奖励:`, JSON.stringify(res))
                            }
                        }else{
                            console.log(`${item.taskName} 领取奖励失败:`, JSON.stringify(res))
                        }
                    }else if(item.awardStatus === 2 && [1].includes(item.orderId)){
                    }
                    await $.wait(1000)
                }else if(item.dateType == 1){
                    // console.log('enensss')
                }
                // break
            }
        }

    }catch (e) {
        $.logErr(e);
    }
}

function printRes(res, msg=''){
    if(res.iRet == 0 && (res.Data || res.ddwCoin || res.ddwMoney || res.strPrizeName)){
        let result = res
        if(res.Data){
            result = res.Data
        }
        if(result.ddwCoin || result.ddwMoney || result.strPrizeName){
            console.log(`${msg}获得:${result.ddwCoin && ' '+result.ddwCoin+'金币' || ''}${result.ddwMoney && ' '+result.ddwMoney+'财富' || ''}${result.strPrizeName && ' '+result.strPrizeName+'红包' || ''}`)
        }else if(result.Prize){
            console.log(`${msg}获得: ${result.Prize.strPrizeName && '优惠券 '+result.Prize.strPrizeName || ''}`)
        }else if(res && res.sErrMsg){
            console.log(res.sErrMsg)
        }else{
            console.log(`${msg}完成`, JSON.stringify(res))
            // console.log(`完成`)
        }
    }else if(res && res.sErrMsg){
        console.log(`${msg}失败:${res.sErrMsg}`)
    }else{
        console.log(`${msg}失败:${JSON.stringify(res)}`)
    }
}
async function noviceTask(){
    let additional= ``
    let stk= ``
    additional= ``
    stk= `_cfd_t,bizCode,dwEnv,ptag,source,strZone`
    await taskGet(`user/guideuser`, stk, additional)
    additional= `&strMark=guider_step&strValue=welcom&dwType=2`
    stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
    await taskGet(`user/SetMark`, stk, additional)
    additional= `&strMark=guider_over_flag&strValue=999&dwType=2`
    stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
    await taskGet(`user/SetMark`, stk, additional)
    additional= `&strMark=guider_step&strValue=999&dwType=2`
    stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
    await taskGet(`user/SetMark`, stk, additional)
    additional= `&strMark=guider_step&strValue=999&dwType=2`
    stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
    await taskGet(`user/SetMark`, stk, additional)
    additional= `&strMark=guider_over_flag&strValue=999&dwType=2`
    stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
    await taskGet(`user/SetMark`, stk, additional)
    additional= `&strMark=guider_step&strValue=gift_redpack&dwType=2`
    stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
    await taskGet(`user/SetMark`, stk, additional)
    additional= `&strMark=guider_step&strValue=none&dwType=2`
    stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
    await taskGet(`user/SetMark`, stk, additional)
}

function taskGet(type, stk, additional){
    return new Promise(async (resolve) => {
        let myRequest = getGetRequest(type, stk, additional)
        $.get(myRequest, async (err, resp, _data) => {
            let data
            try {
                let contents = ''
                // console.log(_data)
                data = $.toObj(_data)
                if(data && data.iRet == 0){
                    // console.log(_data)
                }else{
                    // 1771|1771|5001|0|0,1771|75|1023|0|请刷新页面重试
                    // console.log(_data)
                }
                contents = `1771|${opId(type)}|${data.iRet}|0|${data.sErrMsg || 0}`
                await biz(contents)
            }
            catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve(data);
            }
        });
    });
}
function getGetRequest(type, stk='', additional='') {
    let url = ``;
    if(type == 'user/ComposeGameState'){
        url = `https://m.jingxi.com/jxbfd/${type}?__t=${Date.now()}&strZone=jxbfd&dwFirst=1&_=${Date.now()}&sceneval=2`
    }else if(type == 'user/RealTmReport'){
        url = `https://m.jingxi.com/jxbfd/${type}?__t=${Date.now()}${additional}&_=${Date.now()}&sceneval=2`
    }else{
        let stks = ''
        if(stk) stks = `&_stk=${stk}`
        if(type == 'GetUserTaskStatusList' || type == 'Award' || type == 'Award1' || type == 'DoTask'){
            let bizCode = 'jxbfd'
            if(type == 'Award1'){
                bizCode = 'jxbfddch'
                type = 'Award'
            }
            url = `https://m.jingxi.com/newtasksys/newtasksys_front/${type}?strZone=jxbfd&bizCode=${bizCode}&source=jxbfd&dwEnv=3&_cfd_t=${Date.now()}${additional}${stks}&_ste=1&_=${Date.now()}&sceneval=2&g_login_type=1`
        }else if(type == 'user/ComposeGameAddProcess' || type == 'user/ComposeGameAward'){
            url = `https://m.jingxi.com/jxbfd/${type}?strZone=jxbfd&__t=${Date.now()}${additional}${stks}&_=${Date.now()}&sceneval=2`;
        }else{
            url = `https://m.jingxi.com/jxbfd/${type}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=${additional}${stks}&_=${Date.now()}&sceneval=2`;
        }
        url += `&h5st=${decrypt(Date.now(), stk, '', url)}`;
    }
    return {
        url,
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Connection": "keep-alive",
            'Cookie': $.cookie,
            'Host': 'm.jingxi.com',
            "Referer": "https://st.jingxi.com/",
            "User-Agent": UA,

        }
    }
}

function biz(contents){
    return new Promise(async (resolve) => {
        let myRequest = {
            url:`https://m.jingxi.com/webmonitor/collect/biz.json?contents=${contents}&t=${Math.random()}&sceneval=2`,
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Connection": "keep-alive",
                'Cookie': $.cookie,
                'Host': 'm.jingxi.com',
                "Referer": "https://st.jingxi.com/",
                "User-Agent": UA,
            }
        }
        $.get(myRequest, async (err, resp, _data) => {
            try {
                // console.log(_data)
            }
            catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve();
            }
        });
    });
}

function opId(type){
    let opId = 5001
    if(type == "user/QueryUserInfo") opId = 1
    if(type == "user/GetMgrAllConf") opId = 3
    if(type == "story/QueryUserStory") opId = 5
    if(type == "user/GetJdToken") opId = 11
    if(type == "story/CouponState") opId = 13
    if(type == "story/WelfareDraw") opId = 15
    if(type == "story/GetWelfarePage") opId = 17
    if(type == "story/SendWelfareMoney") opId = 19
    if(type == "user/SetMark") opId = 23
    if(type == "user/GetMark") opId = 25
    if(type == "user/guideuser") opId = 27
    if(type == "user/createbuilding") opId = 29
    if(type == "user/BuildLvlUp") opId = 31
    if(type == "user/CollectCoin") opId = 33
    if(type == "user/GetBuildInfo") opId = 35
    if(type == "user/SpeedUp") opId = 37
    if(type == "story/AddNoticeMsg") opId = 39
    if(type == "user/breakgoldenegg") opId = 41
    if(type == "user/closewindow") opId = 43
    if(type == "user/drawpackprize") opId = 45
    if(type == "user/GetMoneyDetail") opId = 47
    if(type == "user/EmployTourGuide") opId = 49
    if(type == "story/sellgoods") opId = 51
    if(type == "story/querystorageroom") opId = 53
    if(type == "user/queryuseraccount") opId = 55
    if(type == "user/EmployTourGuideInfo") opId = 57
    if(type == "consume/TreasureHunt") opId = 59
    if(type == "story/QueryAppSignList") opId = 61
    if(type == "story/AppRewardSign") opId = 63
    if(type == "task/addCartSkuNotEnough") opId = 123
    if(type == "story/GetActTask") opId = 125
    if(type == "story/ActTaskAward") opId = 127
    if(type == "story/DelayBizReq") opId = 131
    if(type == "story/queryshell") opId = 65
    if(type == "story/QueryRubbishInfo") opId = 67
    if(type == "story/pickshell") opId = 69
    if(type == "story/CollectorOper") opId = 71
    if(type == "story/MermaidOper") opId = 73
    if(type == "story/RubbishOper") opId = 75
    if(type == "story/SpecialUserOper") opId = 77
    if(type == "story/GetUserTaskStatusList") opId = 79
    if(type == "user/ExchangeState") opId = 87
    if(type == "user/ExchangePrize") opId = 89
    if(type == "user/GetRebateGoods") opId = 91
    if(type == "user/BuyGoods") opId = 93
    if(type == "user/UserCashOutState") opId = 95
    if(type == "user/CashOut") opId = 97
    if(type == "user/GetCashRecord") opId = 99
    if(type == "user/CashOutQuali") opId = 101
    if(type == "user/GetAwardList") opId = 103
    if(type == "story/QueryMailBox") opId = 105
    if(type == "story/MailBoxOper") opId = 107
    if(type == "story/UserMedal") opId = 109
    if(type == "story/QueryMedalList") opId = 111
    if(type == "story/GetTakeAggrPage") opId = 113
    if(type == "story/GetTaskRedDot") opId = 115
    if(type == "story/RewardSign") opId = 117
    if(type == "story/helpdraw") opId = 119
    if(type == "story/helpbystage") opId = 121
    if(type == "story/AddSuggest") opId = 133
    return opId
}

async function requestAlgo() {
    $.fp = (getRandomIDPro({ size: 13 }) + Date.now()).slice(0, 16);
    const options = {
        "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
        headers: {
            'Authority': 'cactus.jd.com',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://st.jingxi.com',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': UA,
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://st.jingxi.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
        },
        'body': JSON.stringify({
            "version": "1.0",
            "fp": $.fp,
            "appId": $.appId,
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        })
    }
    return new Promise(async resolve => {
        $.post(options, (err, resp, data) => {
            try {
                const { ret, msg, data: { result } = {} } = JSON.parse(data);
                $.token = result.tk;
                $.genKey = new Function(`return ${result.algo}`)();
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

function getRandomIDPro() {
    var e,
        t,
        a = void 0 === (n = (t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}).size) ? 10 : n,
        n = void 0 === (n = t.dictType) ? 'number' : n,
        i = '';
    if ((t = t.customDict) && 'string' == typeof t) e = t;
    else
        switch (n) {
            case 'alphabet':
                e = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                break;
            case 'max':
                e = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
                break;
            case 'number':
            default:
                e = '0123456789';
        }

    for (; a--;) i += e[(Math.random() * e.length) | 0];
    return i;
}
function decrypt(time, stk, type, url) {
    stk = stk || (url ? getUrlQueryParams(url, '_stk') : '')
    if (stk) {
        const timestamp = format("yyyyMMddhhmmssSSS", time);
        const hash1 = $.genKey($.token, $.fp.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
        let st = '';
        stk.split(',').map((item, index) => {
            st += `${item}:${getUrlQueryParams(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
        })
        const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
        return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fp.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
    } else {
        return encodeURIComponent('20210713151140309;3329030085477162;10032;tk01we5431d52a8nbmxySnZya05SXBQSsarucS7aqQIUX98n+iAZjIzQFpu6+ZjRvOMzOaVvqHvQz9pOhDETNW7JmftM;3e219f9d420850cadd117e456d422e4ecd8ebfc34397273a5378a0edc70872b9')
    }
}

function format(a, time) {
    if (!a) a = 'yyyy-MM-dd';
    var t;
    if (!time) {
        t = Date.now();
    } else {
        t = new Date(time);
    }
    var e,
        n = new Date(t),
        d = a,
        l = {
            'M+': n.getMonth() + 1,
            'd+': n.getDate(),
            'D+': n.getDate(),
            'h+': n.getHours(),
            'H+': n.getHours(),
            'm+': n.getMinutes(),
            's+': n.getSeconds(),
            'w+': n.getDay(),
            'q+': Math.floor((n.getMonth() + 3) / 3),
            'S+': n.getMilliseconds(),
        };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, ''.concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    Object.keys(l).forEach(e => {
        if (new RegExp('('.concat(e, ')')).test(d)) {
            var t,
                a = 'S+' === e ? '000' : '00';
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[e] : ''.concat(a).concat(l[e]).substr(''.concat(l[e]).length));
        }
    });
    return d;
}

function getUrlQueryParams(url_string, param) {
    let reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
    let r = url_string.split('?')[1].substr(0).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    };
    return '';
}



function getAuthorShareCode(url) {
    return new Promise(async resolve => {
        const options = {
            "url": `${url}?${new Date()}`,
            "timeout": 10000,
            "headers": {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
            }
        };
        if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
            const tunnel = require("tunnel");
            const agent = {
                https: tunnel.httpsOverHttp({
                    proxy: {
                        host: process.env.TG_PROXY_HOST,
                        port: process.env.TG_PROXY_PORT * 1
                    }
                })
            }
            Object.assign(options, { agent })
        }
        let res = []
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                } else {
                    if (data) res = JSON.parse(data)
                }
            } catch (e) {
                // $.logErr(e, resp)
            } finally {
                resolve(res || []);
            }
        })
        await $.wait(10000)
        resolve(res);
    })
}

/**
 * 随机从一数组里面取
 * @param arr
 * @param count
 * @returns {Buffer}
 */
function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}


// 计算时间
function timeFn(dateBegin) {
    var hours = 0
    var minutes = 0
    var seconds = 0
    if(dateBegin != 0){
        //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
        var dateEnd = new Date();//获取当前时间
        var dateDiff = dateBegin - dateEnd.getTime();//时间差的毫秒数
        var leave1 = dateDiff % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
        hours = Math.floor(leave1 / (3600 * 1000))//计算出小时数
        //计算相差分钟数
        var leave2 = leave1 % (3600 * 1000)    //计算小时数后剩余的毫秒数
        minutes = Math.floor(leave2 / (60 * 1000))//计算相差分钟数
        //计算相差秒数
        var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
        seconds = Math.round(leave3 / 1000)
    }
    hours = hours < 10 ? '0'+ hours : hours
    minutes = minutes < 10 ? '0'+ minutes : minutes
    seconds = seconds < 10 ? '0'+ seconds : seconds
    var timeFn = hours + ":" + minutes + ":" + seconds;
    return timeFn;
}

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:i,...r}=t;this.got[s](i,r).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}put(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"put";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:i,...r}=t;this.got[s](i,r).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
