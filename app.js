const Telegraf = require('telegraf');
const env = require('dotenv');

const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const DB = require('./mongoDb/mongodb.js');
const User = require('./mongoDb/user.js')

const db = new DB();
db.connect();

env.config();


const TOKEN = process.env.BOT_TOKEN || '';
const bot = new Telegraf(TOKEN);

// const LANGUAGE = [
//     {
//         UZ : 'Ismi-sharifingizni kiriting:'
//     },
//     {
//         RU : 'Введите ваше имя:'
//     }
// ]

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

const LANGUAGE = [
    [
        'Ismi-sharifingizni kiriting:',
        'Asosiy menyu',
        `📱 Telefon raqamingizni yozib yuboring :
        +998 ** *** ** **`,
        'Telefon raqamini yuboring',
        `Siz qaysi shaharda istiqomat qilasiz?`,
        `Sizning telefon raqamingizga kod yuborildi kodni yozing va profilingizni faollashtiring!`
    ],
    [
        'Введите ваше имя:',
        'Главный меню ',
        `📱 Введите свой номер телефона:
        +998 ** *** ** **`,
        `Отправить номер телефона`,
        `В каком городе вы живете?`,
        `Напишите код, отправленный на ваш номер телефона, и активируйте свой профиль!`
    ],
]

const users = [
    {
        name: 'Aydos',
        idTG:'awfde',
        userLang: 'UZ',
        city: 'NUkus',
        phone: 998913056242
    }
];

// START BOT
bot.start(async (ctx) => {
    const findUser = await User.findOne({idTg: ctx.message.from.id});
    // const user = users.findIndex(elem => elem.idTG === ctx.message.from.id);
    // console.log(user)

        if(!findUser) {
            ctx.reply('Assalomu Alaykum Delivery botiga xosh kelibsiz marhamat tilni tanlang', 
            Markup.inlineKeyboard([
                Markup.callbackButton(`O'ZBEK 🇺🇿`, 'UZ'),
                Markup.callbackButton('РУССКИЙ 🇷🇺', 'RU'),
            ]).extra());

            bot.on('callback_query', async (ctx) => {
                const chatID = ctx.callbackQuery.message.chat.id;
                const msgID = ctx.callbackQuery.message.message_id;
                const userTgId = ctx.callbackQuery.from.id;

                let controlCallback;
                if(!controlCallback){
                    if(ctx.callbackQuery.data) {
                        controlCallback = true;
                        const lang = (ctx.callbackQuery.data === 'UZ') ? 'UZ' : 'RU';
                        // users.push({
                        //     name: '',
                        //     idTG: userTgId,
                        //     userLang: lang,
                        //     city: '',
                        //     phone: ''
                        // });
                        const newUser = {
                            name: '',
                            idTg: userTgId,
                            userLang: lang,
                            city: '',
                            phone: ''
                        }
                    const newUserAdddb = await User.create(newUser);
                    bot.telegram.deleteMessage(chatID,msgID);
                    ctx.reply((lang === 'UZ') ? LANGUAGE[0][0] : LANGUAGE[1][0])
                    }
                }

            });
        }

    if(findUser) {
        ctx.reply((findUser.userLang === 'UZ') ? LANGUAGE[0][1] : LANGUAGE[1][1]);
    }
});


bot.on('text', async (ctx) => {
    // const userFind = users.findIndex(elem => elem.idTG === ctx.message.from.id);
    // const user = users[userFind];
    const user = await User.findOne({idTg: ctx.message.from.id});

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
    if(user.name === '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"name" : ctx.message.text}});
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][4] : LANGUAGE[1][4]);
    }else if(user.city === '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"city" : ctx.message.text}});
        
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][2] : LANGUAGE[1][2], option);
    }else if(user.phone === '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ctx.message.text}});

        const menu = (user.userLang === 'UZ') ? userMenu[0] : userMenu[1];
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][5] : LANGUAGE[1][5], Markup.keyboard(menu).resize().extra());
    }else if(ctx.message.text === `Telefon raqamini o'zgartirish` || ctx.message.text === `Изменить номер телефона` && user.phone !== ''){
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ''}});
        
        ctx.reply((user.userLang === 'UZ') ? LANGUAGE[0][2] : LANGUAGE[1][2], option);
    }

});

bot.on('contact', async(ctx) => {
    const user = await User.findOne({idTg: ctx.message.from.id});

    if(user.phone === '') {
        const UPDATE_DATE = await User.updateOne({"idTg": ctx.message.from.id}, {$set : {"phone" : ctx.message.contact.phone_number}});

        const menu = (user.userLang === 'UZ') ? userMenu[0] : userMenu[1];
        ctx.reply((user.userLang === "UZ") ? LANGUAGE[0][5] : LANGUAGE[1][5], Markup.keyboard(menu).resize().extra());
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