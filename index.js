require('dotenv').config();
const { Bot, GrammyError, HttpError, InlineKeyboard, InputFile, Keyboard } = require('grammy');
const path = require('path');

const bot = new Bot(process.env.BOT_API_KEY);

const getMainKeyboard = () => {
    return new InlineKeyboard()
        .text('О Нас', 'about')
        .text('Наши услуги', 'service')
        .row()
        .text('Портфолио', 'portfolio')
        .text('Оставить заявку', 'request');
};

const aboutText = `
О нас

*CBF Marketing Group* – ваш надежный партнер в мире маркетинга и информационных технологий. Мы предлагаем комплексные услуги, объединяющие маркетинговые стратегии и ИТ-решения для бизнеса. Наша миссия – помочь компаниям достичь новых высот, используя передовые инструменты маркетинга и технологий.

Кто мы

С 2017 года мы помогаем компаниям различных отраслей развивать бизнес и укреплять позиции на рынке. Наши эксперты обладают многолетним опытом в цифровом маркетинге и автоматизации бизнес-процессов. Мы предлагаем индивидуальные решения, адаптированные под потребности каждого клиента.
`;

const servicesText = `
Наши услуги

*Маркетинг:*
- *Маркетинговые стратегии:* Разработка и реализация стратегий на основе анализа рынка.
- *Рекламные кампании:* Управление контекстной и таргетированной рекламой.
- *Социальные медиа:* Создание контента и управление аккаунтами.
- *Контент-маркетинг:* Создание качественного контента.
- *Аналитика:* Мониторинг, анализ данных и отчетность.

*ИТ-услуги:*
- *Веб-разработка:* Создание адаптивных веб-сайтов.
- *Автоматизация процессов:* Внедрение CRM и автоматизация маркетинга.

Почему выбирают нас

*Комплексный подход:* Мы объединяем маркетинговые и ИТ-услуги для создания эффективных решений.
*Индивидуальные стратегии:* Персонализированные решения для каждого клиента.
*Опыт:* Высококвалифицированная команда с многолетним опытом.
*Инновации:* Внедрение передовых технологий.
*Прозрачность:* Детализированные отчеты и аналитика.
*Поддержка:* Постоянная техническая поддержка и обучение.
`;

bot.command('start', async (ctx) => {
    await ctx.reply(
        "Приветствую! Я бот маркетинговой компании CBF👋 \n Рад Вас видеть сегодня"
    );
    await ctx.reply("С чего начнем?👇", {
        reply_markup: getMainKeyboard()
    });
});

bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data === 'about') {
        await ctx.reply(aboutText, { parse_mode: 'Markdown' });
        await ctx.answerCallbackQuery('Конечно!');
        await ctx.reply("Продолжим?👇", {
            reply_markup: getMainKeyboard()
        });
    } else if (data === 'service') {
        await ctx.reply(servicesText, { parse_mode: 'Markdown' });
        await ctx.answerCallbackQuery('Непременно!');
        await ctx.reply("Продолжим?👇", {
            reply_markup: getMainKeyboard()
        });
    } else if (data === 'portfolio') {
        const mediaGroup = [
            { type: 'photo', media: new InputFile(path.join(__dirname, 'images', 'image 5.jpg')) },
            { type: 'photo', media: new InputFile(path.join(__dirname, 'images', 'image 4.jpg')) },
            { type: 'photo', media: new InputFile(path.join(__dirname, 'images', 'image 3.jpg')) },
            { type: 'photo', media: new InputFile(path.join(__dirname, 'images', 'image 2.jpg')) },
            { type: 'photo', media: new InputFile(path.join(__dirname, 'images', 'image 1.jpg')) },
        ];
        await ctx.replyWithMediaGroup(mediaGroup);
        await ctx.answerCallbackQuery('Без проблем!');
        await ctx.reply('Остальные кейсы👇\n https://www.instagram.com/thedata.kz.case?igsh=MnZrY2s5MGNydGJu');
        await ctx.reply("Продолжим?👇", {
            reply_markup: getMainKeyboard()
        });
    } else if (data === 'request') {
        const confirmKeyboard = new InlineKeyboard()
            .text('Да', 'confirm_yes')
            .text('Нет', 'confirm_no');
        await ctx.reply("Вы хотите оставить заявку и поделиться вашим номером телефона?", {
            reply_markup: confirmKeyboard
        });
        await ctx.answerCallbackQuery('Секундочку!');
    } else if (data === 'confirm_yes') {
        await ctx.reply("Нажмите кнопку ниже для отправки вашего номера:", {
            reply_markup: new Keyboard()
                .requestContact('Отправить номер')
                .resized()
                .oneTime()
        });
        await ctx.answerCallbackQuery();
    } else if (data === 'confirm_no') {
        await ctx.reply("Продолжим?👇", {
            reply_markup: getMainKeyboard()
        });
        await ctx.answerCallbackQuery('Возвращаемся назад');
    }
});

bot.on('message:contact', async (ctx) => {
    const contact = ctx.message.contact;
    await ctx.reply(`Спасибо! Мы получили ваш номер телефона: ${contact.phone_number}. Наш менеджер скоро свяжется с вами.`);
    await ctx.reply("Продолжим?👇", {
        reply_markup: getMainKeyboard()
    });
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

bot.start();
