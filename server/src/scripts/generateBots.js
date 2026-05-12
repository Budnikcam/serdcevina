const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// ==== Данные для генерации ====

const femaleNames = [
  'Анна', 'Мария', 'Екатерина', 'Ольга', 'Дарья', 'Елена', 'Наталья', 
  'Ирина', 'Татьяна', 'Светлана', 'Юлия', 'Анастасия', 'Ксения', 'Виктория',
  'Александра', 'Полина', 'Вероника', 'Алёна', 'Евгения', 'Маргарита',
  'Валерия', 'Кристина', 'Диана', 'Арина', 'София', 'Милана', 'Алиса',
  'Варвара', 'Карина', 'Элина'
];

const maleNames = [
  'Александр', 'Максим', 'Дмитрий', 'Иван', 'Артём', 'Сергей', 'Андрей',
  'Никита', 'Михаил', 'Даниил', 'Егор', 'Роман', 'Кирилл', 'Владимир',
  'Павел', 'Илья', 'Алексей', 'Денис', 'Арсений', 'Тимур',
  'Матвей', 'Ярослав', 'Глеб', 'Марк', 'Руслан', 'Олег', 'Станислав',
  'Виктор', 'Фёдор', 'Георгий'
];

const cities = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск',
  'Краснодар', 'Сочи', 'Владивосток', 'Самара', 'Калининград'
];

const interestsPool = [
  'спорт', 'музыка', 'кино', 'путешествия', 'книги', 'искусство',
  'фотография', 'кулинария', 'танцы', 'йога', 'технологии', 'игры',
  'природа', 'гитара', 'велоспорт', 'плавание', 'рисование', 'театр',
  'психология', 'саморазвитие', 'медитация', 'волонтёрство', 'кошки',
  'собаки', 'компьютерные игры', 'настольные игры', 'скейтбординг',
  'сноуборд', 'сёрфинг', 'блогинг'
];

const personalities = [
  'ENFP - Коммуникатор', 'INFJ - Активист', 'ISFP - Художник',
  'ESTJ - Менеджер', 'INTP - Учёный', 'ESFJ - Консул',
  'INTJ - Стратег', 'ENTP - Изобретатель', 'ISTJ - Инспектор',
  'ESTP - Делец', 'INFP - Посредник', 'ENFJ - Тренер'
];

const femaleBios = [
  'Люблю жизнь во всех проявлениях! Занимаюсь {interest1} и {interest2}. Ищу человека для уютных вечеров и весёлых приключений.',
  'Творческая душа, работаю дизайнером. Обожаю {interest1}. В поиске вдохновляющего партнёра.',
  'Спортсменка и путешественница. Свободное время провожу за {interest1} и {interest2}. Важно чувство юмора!',
  'Врач по профессии, музыкант в душе. Увлекаюсь {interest1}. Ищу глубокого и интересного человека.',
  'Преподаватель йоги и любительница {interest1}. Ценю гармонию и искренность в отношениях.',
  'Работаю в IT, но в душе — художник. {interest1} и {interest2} — моя отдушина. Ищу единомышленника.',
  'Фотограф и блогер. Люблю {interest1} и новые знакомства. Жду предложений для совместных проектов!',
];

const maleBios = [
  'Программист с активной жизненной позицией. Увлекаюсь {interest1} и {interest2}. Ищу девушку для серьёзных отношений.',
  'Предприниматель и путешественник. В свободное время {interest1}. Важны общие ценности и взаимопонимание.',
  'Спортсмен, люблю {interest1}. Ищу активную и позитивную девушку для совместных тренировок и не только.',
  'Инженер и меломан. Играю на {interest1}. Буду рад познакомиться с творческой и интересной девушкой.',
  'Врач, увлекаюсь {interest1} и {interest2}. Ценю честность и доброту в людях.',
  'Дизайнер и фотограф. Моя страсть — {interest1}. Ищу музу и партнёра для творческих проектов.',
  'Бизнесмен, спортсмен, любитель {interest1}. Главное в отношениях — взаимоуважение и общие цели.',
];

const lookingForOptions = [
  'Серьёзные отношения',
  'Дружбу и общение',
  'Человека с чувством юмора',
  'Единомышленника для путешествий',
  'Романтические отношения',
  'Человека для совместного роста',
  'Родственную душу',
];

// ==== Генераторы ====

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset(arr, min, max) {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateBio(gender) {
  const templates = gender === 'female' ? femaleBios : maleBios;
  const template = randomChoice(templates);
  const interests = randomSubset(interestsPool, 2, 5);
  
  return template
    .replace('{interest1}', interests[0] || 'хобби')
    .replace('{interest2}', interests[1] || 'спорт');
}

function generateBot(gender, index) {
  const names = gender === 'female' ? femaleNames : maleNames;
  const name = names[index % names.length];
  
  const interests = randomSubset(interestsPool, 3, 6);
  const personality = randomChoice(personalities);
  
  return {
    name,
    age: gender === 'female' ? randomInt(20, 35) : randomInt(22, 40),
    gender,
    city: randomChoice(cities),
    bio: generateBio(gender),
    interests: interests.map(i => `🎯 ${i}`),
    lookingFor: randomChoice(lookingForOptions),
    isBot: true,
    isVerified: true,
    isOnline: Math.random() > 0.5,
    likesReceived: randomInt(0, 200),
    likesGiven: randomInt(0, 100),
    matches: randomInt(0, 30),
    lastActive: new Date(Date.now() - randomInt(0, 86400000)),
    photos: [`https://i.pravatar.cc/400?img=${randomInt(1, 70)}`],
    
    aiAnalysis: {
      personalityType: personality.split(' - ')[0],
      traits: personality.split(' - ')[1]?.split(', ') || [],
      values: ['развитие', 'искренность', 'гармония'],
      communicationStyle: Math.random() > 0.5 ? 'Открытый и дружелюбный' : 'Вдумчивый и глубокий',
      idealPartner: lookingForOptions[randomInt(0, lookingForOptions.length - 1)],
      rawAnalysis: `ИИ-портрет: ${personality}`,
      analyzedAt: new Date()
    },
    
    botConfig: {
      activityLevel: Math.random() * 0.5 + 0.5, // 0.5 - 1.0
      replyChance: Math.random() * 0.3 + 0.7,   // 0.7 - 1.0
      likeChance: Math.random() * 0.4 + 0.1,     // 0.1 - 0.5
      personality: personality,
      conversationStyle: ['Лёгкий и весёлый', 'Глубокий и вдумчивый', 'Игривый и кокетливый', 'Прямой и честный'][randomInt(0, 3)],
    }
  };
}

// ==== Главная функция ====

async function generateAllBots() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Сердцевина');
    console.log('✅ Подключено к MongoDB');
    
    // Удаляем старых ботов
    const deletedBots = await User.deleteMany({ isBot: true });
    console.log(`🗑️ Удалено старых ботов: ${deletedBots.deletedCount}`);
    
    // Генерируем 30 девушек
    const femaleBots = [];
    for (let i = 0; i < 30; i++) {
      femaleBots.push(generateBot('female', i));
    }
    
    // Генерируем 30 парней
    const maleBots = [];
    for (let i = 0; i < 30; i++) {
      maleBots.push(generateBot('male', i));
    }
    
    // Сохраняем всех
    const allBots = [...femaleBots, ...maleBots];
    const created = await User.insertMany(allBots);
    
    console.log(`\n🤖 Генерация завершена!`);
    console.log(`👩 Создано женских ботов: ${femaleBots.length}`);
    console.log(`👨 Создано мужских ботов: ${maleBots.length}`);
    console.log(`📊 Всего ботов: ${created.length}`);
    
    // Статистика
    const stats = {
      total: created.length,
      online: created.filter(b => b.isOnline).length,
      avgAge: Math.round(created.reduce((sum, b) => sum + b.age, 0) / created.length),
      cities: [...new Set(created.map(b => b.city))].length,
      avgLikes: Math.round(created.reduce((sum, b) => sum + b.likesReceived, 0) / created.length),
    };
    
    console.log('\n📈 Статистика ботов:');
    console.log(JSON.stringify(stats, null, 2));
    
    await mongoose.connection.close();
    console.log('\n✅ Готово!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

generateAllBots();
