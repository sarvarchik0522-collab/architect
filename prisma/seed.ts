import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed boshlanmoqda...')

  // User
  const user = await prisma.user.upsert({
    where: { email: 'architect@demo.com' },
    update: {},
    update: { name: 'Sarvarbek Mamatov' },
    create: {
      name: 'Sarvarbek Mamatov',
      email: 'architect@demo.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'architect',
    },
  })
  console.log('✅ Foydalanuvchi:', user.email)

  // Clients
  const c1 = await prisma.client.create({ data: { name:'Bobur Toshmatov', phone:'+998901234567', email:'bobur@example.com', company:'ABC Qurilish LLC', address:'Toshkent, Chilonzor 14', userId:user.id } })
  const c2 = await prisma.client.create({ data: { name:'Nodira Yusupova',  phone:'+998712345678', email:'nodira@example.com', company:'XYZ Development',  address:'Samarqand, Registon 5', userId:user.id } })
  const c3 = await prisma.client.create({ data: { name:'Jasur Mirzaev',    phone:'+998931234567', address:'Namangan, Mustaqillik 22', userId:user.id } })
  console.log('✅ Mijozlar yaratildi')

  // Projects
  const p1 = await prisma.project.create({ data: { name:'Chilonzor Turar-joy Kompleksi', address:'Toshkent, Chilonzor tumani', startDate:new Date('2025-01-15'), deadline:new Date('2026-08-30'), status:'WORKING_DESIGN', description:'12 qavatli turar-joy binosi loyihasi', budget:250000000, userId:user.id, clientId:c1.id } })
  const p2 = await prisma.project.create({ data: { name:'Samarqand Savdo Markazi',       address:'Samarqand, Registon maydoni',  startDate:new Date('2025-03-01'), deadline:new Date('2026-12-31'), status:'CONCEPT',       description:'4 qavatli zamonaviy savdo markazi',  budget:180000000, userId:user.id, clientId:c2.id } })
  const p3 = await prisma.project.create({ data: { name:'Namangan Villa Loyihasi',       address:"Namangan, Uychi ko'chasi 7",    startDate:new Date('2024-09-01'), deadline:new Date('2025-03-31'), status:'COMPLETED',     description:'2 qavatli zamonaviy villa',           budget:80000000,  userId:user.id, clientId:c3.id } })
  const p4 = await prisma.project.create({ data: { name:'Toshkent Ofis Binosi',          address:'Toshkent, Yunusobod 19',        startDate:new Date('2025-05-01'), deadline:new Date('2026-12-01'), status:'SKETCH',         description:'8 qavatli ofis binosi eskizi',        budget:320000000, userId:user.id, clientId:c1.id } })
  console.log('✅ Loyihalar yaratildi')

  // Notes
  await prisma.projectNote.createMany({ data: [
    { projectId:p1.id, content:'Birinchi bosqich — poydevor ishlari boshlandi. Barcha ruxsatnomalar tayyor.' },
    { projectId:p1.id, content:'Mijoz bilan uchrashildi. Balkonlar dizayni o\'zgartirildi.' },
    { projectId:p2.id, content:'Konsept taqdimoti mijozga maqul keldi. Keyingi bosqichga o\'tildi.' },
    { projectId:p3.id, content:'Loyiha muvaffaqiyatli tugallandi. Mijoz mamnun.' },
  ]})

  // Diary
  await prisma.diary.createMany({ data: [
    { date:new Date('2026-05-28'), title:'Loyiha taqdimoti',          description:'Chilonzor loyihasining 3D ko\'rinishlarini taqdim etdim', workDone:'3D render tayyorladim, taqdimot o\'tkazdim', problems:'Balkonlar rangi bo\'yicha kelishmovchilik', decisions:'Balkonlar uchun kulrang fasad tanlandi', mood:'GOOD', userId:user.id },
    { date:new Date('2026-05-27'), title:'Texnik hujjatlar',           description:'Ishchi loyiha hujjatlari ustida ish', workDone:'Elektr sxemasi, suv ta\'minoti loyihasi yakunlandi', problems:'Santexnika bo\'limida xatolik topildi', decisions:'Santexnika loyihasini qayta tekshirish', mood:'NEUTRAL', userId:user.id },
    { date:new Date('2026-05-26'), title:'Mijoz uchrashuvi',           description:'Nodira xonim bilan Samarqand SM muhokamasi', workDone:'Birinchi qavat planografi taqdim etildi', problems:'Parking joylari kam bo\'lishi mumkin', decisions:'Yerosti parkingni loyihaga qo\'shish ko\'rilmoqda', mood:'GREAT', userId:user.id },
    { date:new Date('2026-05-25'), title:'AutoCAD ishlari',            description:'Ofis binosi planlarini chizish', workDone:'1-4 qavatlar planlari tugallandi', problems:null, decisions:'Ertaga 5-8 qavatlar planlariga o\'tiladi', mood:'GOOD', userId:user.id },
    { date:new Date('2026-05-20'), title:'Haftalik yig\'ilish',        description:'Jamoa bilan haftalik natijalar muhokamasi', workDone:'Barcha loyihalar holati ko\'rib chiqildi', problems:'Chilonzor loyihasida kechikish xavfi', decisions:'Qo\'shimcha muhandis jalb qilish', mood:'NEUTRAL', userId:user.id },
  ]})
  console.log('✅ Kundaliklar yaratildi')

  // Tasks
  await prisma.task.createMany({ data: [
    { title:'Chilonzor 3D renderlarini tugallash',    description:'Barcha burchaklardan render qilish', deadline:new Date('2026-06-05'), priority:'HIGH',   status:'IN_PROGRESS', order:1, userId:user.id, projectId:p1.id },
    { title:'Samarqand SM konsept taqdimoti',          description:'PowerPoint va PDF formatida',        deadline:new Date('2026-06-10'), priority:'HIGH',   status:'TODO',        order:2, userId:user.id, projectId:p2.id },
    { title:'Ruxsatnomalar paketi tayyorlash',         description:'Shaharsozlik qo\'mitasi uchun',       deadline:new Date('2026-06-15'), priority:'MEDIUM', status:'TODO',        order:3, userId:user.id },
    { title:'Ofis binosi eskizini yakunlash',          description:'Fasad va ichki ko\'rinishlar',         deadline:new Date('2026-06-20'), priority:'MEDIUM', status:'IN_PROGRESS', order:1, userId:user.id, projectId:p4.id },
    { title:'Eski loyihalar arxivini tartibga keltirish', description:'Barcha fayllarni papkalarga joylash', deadline:new Date('2026-06-30'), priority:'LOW',  status:'TODO',        order:4, userId:user.id },
    { title:'Villa loyihasi hisob-faktura yuborish',   description:'To\'lov uchun hujjat tayyorlash',      deadline:new Date('2026-05-31'), priority:'HIGH',   status:'DONE',        order:1, userId:user.id, projectId:p3.id },
  ]})
  console.log('✅ Vazifalar yaratildi')

  // Income
  await prisma.income.createMany({ data: [
    { date:new Date('2026-01-15'), amount:15000000, description:'Dastlabki to\'lov — Chilonzor',  category:'PROJECT_PAYMENT', userId:user.id, projectId:p1.id, clientId:c1.id },
    { date:new Date('2026-02-20'), amount:12000000, description:'Ikkinchi bosqich to\'lovi',        category:'PROJECT_PAYMENT', userId:user.id, projectId:p1.id, clientId:c1.id },
    { date:new Date('2026-03-10'), amount:8000000,  description:'Samarqand SM konsept to\'lovi',   category:'PROJECT_PAYMENT', userId:user.id, projectId:p2.id, clientId:c2.id },
    { date:new Date('2026-04-05'), amount:20000000, description:'Villa loyihasi yakuniy to\'lov',  category:'PROJECT_PAYMENT', userId:user.id, projectId:p3.id, clientId:c3.id },
    { date:new Date('2026-05-01'), amount:5000000,  description:'Konsultatsiya xizmati',            category:'CONSULTATION',    userId:user.id },
    { date:new Date('2026-05-15'), amount:10000000, description:'Ofis binosi avans',                category:'ADVANCE',         userId:user.id, projectId:p4.id, clientId:c1.id },
  ]})

  // Expense
  await prisma.expense.createMany({ data: [
    { date:new Date('2026-01-10'), amount:2500000, description:"AutoCAD litsenziya yangilash",    category:'SOFTWARE',        userId:user.id },
    { date:new Date('2026-02-01'), amount:1200000, description:'Ofis ijara — fevral',              category:'RENT',            userId:user.id },
    { date:new Date('2026-02-15'), amount:800000,  description:'Printer kartridjlari va qog\'oz', category:'OFFICE_SUPPLIES', userId:user.id },
    { date:new Date('2026-03-01'), amount:1200000, description:'Ofis ijara — mart',               category:'RENT',            userId:user.id },
    { date:new Date('2026-03-20'), amount:3000000, description:'Yangi grafik planshet',            category:'EQUIPMENT',       userId:user.id },
    { date:new Date('2026-04-01'), amount:1200000, description:'Ofis ijara — aprel',              category:'RENT',            userId:user.id },
    { date:new Date('2026-05-01'), amount:1200000, description:'Ofis ijara — may',                category:'RENT',            userId:user.id },
    { date:new Date('2026-05-10'), amount:500000,  description:'Transport xarajatlari',            category:'TRANSPORT',       userId:user.id },
  ]})
  console.log('✅ Moliya yozuvlari yaratildi')

  console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!')
  console.log('📧 Login: architect@demo.com')
  console.log('🔑 Parol: admin123')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
