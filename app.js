const Telegraf = require('telegraf');
const env = require('dotenv');
const nodemailer = require('nodemailer');

const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const DB = require('./mongoDb/mongodb.js');
const User = require('./mongoDb/user.js');
const { type } = require('os');

const db = new DB();
db.connect();
env.config();

const TOKEN = process.env.BOT_TOKEN || '';
const bot = new Telegraf(TOKEN);

const menues = {
    'globalMenuUZ' : {
        'back' : [`Orqaga`],
        'globl' : [`Buyurtma berish`,`Biz haqmizda`, `Sozlamalar`],
        'delivery' : [[`Yetkazib berish`, `Olib ketish`],[`Orqaga`]],
        'locationMenu': [['Eng yaqin filialimizni aniqlash'],[`Orqaga`]],
        'settings' : [[`Ma’lumotlarni o’zgartirish`], [`Orqaga`]],
        'settings_inside' : [[`Ismni o’zgartirish`, `Telefon raqamni o’zgartirish`], [`Shaharni tanlang`, `🇺🇿 Tilni tanlang`], [`Orqaga`]],
    },
    'globalMenuRU': {
        'back' : [`Назад`],
        'globl' : [`Заказать`,`О нас`, `Настройки`],
        'delivery' : [[`Доставка`, `Самовывоз`],[`Назад`]],
        'locationMenu': [[`Определите наш ближайший филиал`],[`Назад`]],
        'settings' : [[`Изменить данные`], [`Назад`]],
        'settings_inside' : [[`Сменить имя`, `Изменить номер телефона`], [`Выбрать город`, `🇷🇺 Выбрать язык`], [`Назад`]]
    }
}

const regionsUz = [
    [`Toshkent`, `Andijon`],
    [`Qarshi`, `Farg'ona`],
    [`Samarqand`]
]
const regionsRu = [
    [`Ташкент`, `Андижан`],
    [`Карши`, `Фергана`],
    [`Самарканд`]
]
const change_lang_menu = [[`🇷🇺 Русский`, `🇺🇿 O'zbekcha`]];
const userMenu = [
    [
        `Telefon raqamini o'zgartirish`,
        `Kodni yana bir bor yuboring`
    ],
    [
        'Изменить номер телефона',
        'Отправьте код еще раз'
    ]
]

// BOT'S WORD
const LANGUAGE = [
    [
        'Ismi-sharifingizni kiriting:', // 0
        'Asosiy menyu',     // 1
        `📱 Telefon raqamingizni yozib yuboring :
        +998 ** *** ** **`,     // 2
        'Telefon raqamini yuboring',    // 3
        `Siz qaysi shaharda istiqomat qilasiz?`,    // 4
        `Sizning telefon raqamingizga kod yuborildi kodni yozing va profilingizni faollashtiring!`, // 5
        `Iltimos email manzilingizni yozing!`,  // 6
        `Sizning email manzilingizga kod yuborildi kodni yozing va profilingizni faollashtiring!`,  // 7
        `Siz royhatdan ola darajada otingiz endi siz bemalol botga buyurtmalar berishingiz mumkin !`,   // 8

        `Buyurtmani o'zingiz olib ketasizmi yoki Yetkazib beramizmi`,   // 9
        `Location jonatsangiz sizga eng yaqin bolgan filialni aniqlaymiz va yetkazib berish xarajatlarini aniqlaymiz `, // 10
        `Qaerdasiz Agar Location yuborsangiz, sizga eng yaqin filialni aniqlaymiz`,  // 11
        `Sozlamalar`, // 12
        `Ma’lumotlarni o’zgartirish`, // 13
        `Ismni kiriting`, // 14
        `Shaharni tanlang`, // 15
        `🇺🇿 Tilni tanlang`, // 16
        
    ],
    [
        'Введите ваше имя:',    // 0
        'Главный меню ',    // 1
        `📱 Введите свой номер телефона:
        +998 ** *** ** **`,    // 2
        `Отправить номер телефона`,    // 3
        `В каком городе вы живете?`,    // 4
        `Напишите код, отправленный на ваш номер телефона, и активируйте свой профиль!`,    // 5
        `Пожалуйста, введите адрес эмаил!`,    // 6
        `Введите код, отправленный на ваш адрес электронной почты, и активируйте свой профиль!`,    // 7
        `Вы успешно завершили, теперь вы можете заказать блюдо, которое вы хотите`,    // 8

        `Заберите свой заказ самостоятельно или выберите доставку`,    // 9
        `Куда нужно доставить ваш заказ Если вы отправите локацию, мы определим ближайший к вам филиал и стоимость доставки `,    // 10
        `Где вы находитесь. Если вы отправите локацию, мы определим ближайший к вам филиал`,    // 11
        `Настройки`, // 12
        `Изменить данные`, // 13
        `Введите имя`, // 14
        `Выберите город`, // 15
        `🇷🇺 Выбрать язык`, // 16

    ],
]

// START BOT
bot.start(async (ctx) => {
    let controlCallback;

    const findUser = await User.findOne({idTg: ctx.message.from.id});
    // const user = users.findIndex(elem => elem.idTG === ctx.message.from.id);
    // console.log(user)

        if(!findUser) {
            ctx.reply(`Assalomu Alaykum Delivery botiga xush kelibsiz marhamat tilni tanlang !
Добро пожаловать в бот Delivery, пожалуйста, выберите язык !`, 
            Markup.inlineKeyboard([
                Markup.callbackButton(`O'ZBEK 🇺🇿`, 'UZ'),
                Markup.callbackButton('РУССКИЙ 🇷🇺', 'RU'),
            ]).extra());
            
            bot.on('callback_query', async (ctx) => {
                const chatID = ctx.callbackQuery.message.chat.id;
                const msgID = ctx.callbackQuery.message.message_id;
                const userTgId = ctx.callbackQuery.from.id;
                
                if(!controlCallback){
                    if(ctx.callbackQuery.data) {
                        const lang = (ctx.callbackQuery.data === 'UZ') ? 'UZ' : 'RU';
                        controlCallback = true;
                        const newUser = {
                            name: '',
                            idTg: userTgId,
                            userLang: lang,
                            city: '',
                            phone: '',
                            gmail: '',
                            smsCode: false
                        }
                    const newUserAdddb = await User.create(newUser);
                    bot.telegram.deleteMessage(chatID,msgID);
                    ctx.reply((lang === 'UZ') ? LANGUAGE[0][0] : LANGUAGE[1][0]);
                    }
                }

            });
        }

    if(findUser) {

        if(findUser.name === '' && findUser.smsCode === false) {
            ctx.reply((findUser.userLang === 'UZ') ? LANGUAGE[0][0] : LANGUAGE[1][0]);
        }else if(findUser.city === ''  && findUser.smsCode === false ) {
            // const menu = (findUser.userLang === 'UZ') ? userMenu[0] : userMenu[1];

            ctx.reply((findUser.userLang === 'UZ') ? LANGUAGE[0][4] : LANGUAGE[1][4],  Markup.keyboard((findUser.userLang === 'UZ') ? regionsUz : regionsRu).resize().extra());
        }else if(findUser.phone === ''  && findUser.smsCode === false) {            
            var option = {
                "reply_markup": {
                    "one_time_keyboard": true,
                    "keyboard": [[{
                        text: (findUser.userLang === 'UZ') ? LANGUAGE[0][3] : LANGUAGE[1][3],
                        request_contact: true
                    }]],
                    "one_time_keyboard": true,
                    "resize_keyboard": true,
                }
            };
            ctx.reply((findUser.userLang === 'UZ') ? LANGUAGE[0][2] : LANGUAGE[1][2], option);
        }else {

            ctx.reply((findUser.userLang === 'UZ') ? LANGUAGE[0][1] : LANGUAGE[1][1], Markup.keyboard((findUser.userLang === 'UZ') ? menues['globalMenuUZ']['globl'] : menues['globalMenuRU']['globl']).resize().extra());
        }
    }
});

const randomNumberFn = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

let ramdomNumPast;


const sendMailUser = (userGmailCtx) => {

    ramdomNumPast = randomNumberFn(1000, 9999);

    let mailOptions = {
        from: process.env.userGmail,
        to: userGmailCtx,
        subject: 'Delivery bot',
        text: `Profilingizni foallashtrishingiz ushun maxsus kode: ${ ramdomNumPast }`
    }
    console.log(ramdomNumPast)
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.userGmail, // generated ethereal user
            pass: process.env.pass, // generated ethereal password
        },
    });

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) return console.log(error)
        console.log("NIce" + info.response)
    });
}

// bot.on('callback_query', ctx => {
//     if (ctx.data == `back3`) {
//         console.log(ctx.data)
//    }
// });

let change_Lang = false;

bot.on('text', async (ctx) => {
    bot.on('callback_query', async (ctx) => {
        if(ctx.callbackQuery.data === 'go-back_3') {
            console.log(`I'm this bug to fix`)
        }
    });

    if(ctx.message.text === 'delete') {
    const user = await User.deleteOne({idTg: ctx.message.from.id});
    return;
    }
    
    // bot.on('callback_query', async ctx => {
    //     if (ctx.data == `back3`) {
    //         ctx.reply('siz orqaga qaytingiz')
    //    }
    // })

    const user = await User.findOne({idTg: ctx.message.from.id});
    
    const menuesLocal = (user.userLang === 'UZ') ? menues['globalMenuUZ'] : menues['globalMenuRU'];

    var option = {
        "reply_markup": {
            "one_time_keyboard": true,
            "keyboard": [[{
                text: (user.userLang === 'UZ') ? LANGUAGE[0][3] : LANGUAGE[1][3],
                request_contact: true
            }]],
            "one_time_keyboard" : true,
        "resize_keyboard" : true,
        }
    };

    const inlineButton = {
        reply_markup : {
            inline_keyboard: [
                [{text: `${(user.userLang === 'UZ') ? '◀️ Orqaga' : '◀️ Назад'}`, callback_data: 'go-back_3'}]
            ]
        }
    }

    // user's location menu
    const opts = {
        reply_markup: JSON.stringify({
          keyboard: [
            [{text: `${menuesLocal['locationMenu'][0]}`, request_location: true}],
            [{text: `${menuesLocal['locationMenu'][1]}`}]
          ],
          resize_keyboard: true
        }),
      };
    
    if(ctx.message.text === `Buyurtma berish` || ctx.message.text === `Заказать`) {
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][9] : LANGUAGE[1][9],  Markup.keyboard(menuesLocal['delivery']).resize().extra());
    }else if(ctx.message.text === `Yetkazib berish` || ctx.message.text === `Доставка`) {

        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][10] : LANGUAGE[1][10],  opts);

    }else if(ctx.message.text === "Olib ketish" || ctx.message.text === "Самовывоз"){
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][10] : LANGUAGE[1][10],  opts);
    }else if(ctx.message.text === "Sozlamalar" || ctx.message.text === "Настройки") {
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][12] : LANGUAGE[1][12], Markup.keyboard(menuesLocal['settings']).resize().extra())
    }else if(ctx.message.text === "Ma’lumotlarni o’zgartirish" || ctx.message.text === "Изменить данные") {
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][13] : LANGUAGE[1][13], Markup.keyboard(menuesLocal['settings_inside']).resize().extra())
    }

    // EVENT TO CHANGE USER'S DATA

    if(ctx.message.text === `Ismni o’zgartirish` || ctx.message.text === `Сменить имя` && user.name !== '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"name" : ''}});
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][14] : LANGUAGE[1][14], Markup.keyboard(menuesLocal['back']).resize().extra());
        return;
    }else if(ctx.message.text === 'Telefon raqamni o’zgartirish' || ctx.message.text === "Изменить номер телефона" && user.smsCode === true) {
        const UPDATE_PHONE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ''}});
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][2] : LANGUAGE[1][2], option);
        return;
    }else if(ctx.message.text === 'Shaharni tanlang' || ctx.message.text === "Выбрать город" && user.smsCode === true) {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"city" : ''}});
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][15] : LANGUAGE[1][15],  Markup.keyboard((user.userLang === 'UZ') ? regionsUz : regionsRu).resize().extra());
    }else if(ctx.message.text === '🇺🇿 Tilni tanlang' || ctx.message.text === "🇷🇺 Выбрать язык" && user.smsCode === true) {
        change_Lang = true;
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][16] : LANGUAGE[1][16],  Markup.keyboard(change_lang_menu).resize().extra());
    }

    if(ctx.message.text === 'Orqaga') {
        console.log(ctx.message)
    }

    // ETITION USER'S DATA

     if(user.name === '' && user.smsCode === true) {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"name" : ctx.message.text}});
        
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][12] : LANGUAGE[1][12], Markup.keyboard(menuesLocal['settings']).resize().extra())
    }else if(user.phone === '' && user.smsCode === true){
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ctx.message.text}});

        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][12] : LANGUAGE[1][12], Markup.keyboard(menuesLocal['settings']).resize().extra())
    }else if(user.city === '' && user.smsCode === true) {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"city" : ctx.message.text}});
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][12] : LANGUAGE[1][12], Markup.keyboard(menuesLocal['settings']).resize().extra())
    }else if (user.userLang === 'UZ' && change_Lang && ctx.message.text === `🇷🇺 Русский`) {
        change_Lang = false;
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"userLang" : 'RU'}});
        const UPDATE_USER = await User.findOne({idTg: ctx.message.from.id});
        ctx.reply((UPDATE_USER.userLang === 'UZ') ? LANGUAGE[0][13] : LANGUAGE[1][13],  Markup.keyboard((UPDATE_USER.userLang === 'UZ') ? menues['globalMenuUZ']['settings_inside'] : menues['globalMenuRU']['settings_inside']).resize().extra());
    }else if (user.userLang === 'RU' && change_Lang && ctx.message.text === `🇺🇿 O'zbekcha`) {
        change_Lang = false;
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"userLang" : 'UZ'}});
        const UPDATE_USER = await User.findOne({idTg: ctx.message.from.id});
        ctx.reply((UPDATE_USER.userLang === 'UZ') ? LANGUAGE[0][13] : LANGUAGE[1][13],  Markup.keyboard((UPDATE_USER.userLang === 'UZ') ? menues['globalMenuUZ']['settings_inside'] : menues['globalMenuRU']['settings_inside']).resize().extra());
    }

    // SMS CODE CONTROLLER
    if(user.smsCode === false) {

    if(user.name === '' && user.city === '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"name" : ctx.message.text}});
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][4] : LANGUAGE[1][4],  Markup.keyboard((user.userLang === 'UZ') ? regionsUz : regionsRu).resize().extra());
    }else if(ctx.message.text === `Telefon raqamini o'zgartirish` || ctx.message.text === `Изменить номер телефона` && user.phone !== ''){
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ''}});
        
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][2] : LANGUAGE[1][2], option);
    }else if(ctx.message.text === `Kodni yana bir bor yuboring` || ctx.message.text === `Отправьте код еще раз` && user.gmail !== '') {
        sendMailUser(user.gmail);
        const menu = (user.userLang === 'UZ') ? userMenu[0] : userMenu[1];
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][7] : LANGUAGE[1][7],  Markup.keyboard(menu).resize().extra());
    }else if(user.city === '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"city" : ctx.message.text}});
        
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][2] : LANGUAGE[1][2], option);
    }else if(user.phone === '') {

        // USER'S PHONE NUMBER REGEX THIS REGEX ONLY TALES THE NUMBER 

        const regexp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/im.test(ctx.message.text);

        console.log(typeof ctx.message.text, regexp)
        const menu = (user.userLang === 'UZ') ? userMenu[0] : userMenu[1];
        if(regexp) {
            const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ctx.message.text}});
    
            const menu = (user.userLang === 'UZ') ? userMenu[0] : userMenu[1];
            // Markup.keyboard(menu).resize().extra()
            ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][6] : LANGUAGE[1][6],  Markup.keyboard(menu).resize().extra());
        }else {
            ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][2] : LANGUAGE[1][2],  Markup.keyboard(menu).resize().extra());
        }
    }else if(user.gmail === '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"gmail" : ctx.message.text}});

        const userGmailCtx = ctx.message.text;

        sendMailUser(userGmailCtx);

        const menu = (user.userLang === 'UZ') ? userMenu[0] : userMenu[1];
        
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][7] : LANGUAGE[1][7],  Markup.keyboard(menu).resize().extra());

    }else if(parseInt(ctx.message.text) === ramdomNumPast && user.gmail !== '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"smsCode" : true}});
        ramdomNumPast = '';
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][8] : LANGUAGE[1][8], Markup.keyboard(menuesLocal['globl']).resize().extra());
    }else {
        return
    }

    } // SMS CODE CONTROLLER


});

bot.on('contact', async(ctx) => {
    const user = await User.findOne({idTg: ctx.message.from.id});

    if(user.phone === '' && user.smsCode === false) {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ctx.message.contact.phone_number}});

        const menu = (user.userLang === 'UZ') ? userMenu[0] : userMenu[1];
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][6] : LANGUAGE[1][6], Markup.keyboard(menu).resize().extra());
    }else if(user.phone === '' && user.smsCode === true) {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ctx.message.contact.phone_number}});

        const menuesLocal = (user.userLang === 'UZ') ? menues['globalMenuUZ'] : menues['globalMenuRU'];
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][12] : LANGUAGE[1][12], Markup.keyboard(menuesLocal['settings']).resize().extra())
    }
    // console.log(user);
});

bot.launch()
    .then(() => {
     console.log('bot start')   
    }).catch((err) => {
        console.log('lounch error: ' + err);
    });

bot.startPolling();