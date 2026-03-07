const { hash } = require("bcryptjs");
const { db } = require("../src/db/index");

function toDate(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function buildDirectKey(userAId, userBId) {
  return [userAId, userBId].sort().join(":");
}

async function upsertConversationWithParticipants(
  userAId,
  userBId,
  appointmentId = null,
) {
  const directKey = buildDirectKey(userAId, userBId);

  const conversation = await db.conversation.upsert({
    where: { directKey },
    update: {
      appointmentId: appointmentId || undefined,
    },
    create: {
      isDirect: true,
      directKey,
      appointmentId,
    },
  });

  await db.conversationParticipant.upsert({
    where: {
      conversationId_userId: {
        conversationId: conversation.id,
        userId: userAId,
      },
    },
    update: {},
    create: {
      conversationId: conversation.id,
      userId: userAId,
    },
  });

  await db.conversationParticipant.upsert({
    where: {
      conversationId_userId: {
        conversationId: conversation.id,
        userId: userBId,
      },
    },
    update: {},
    create: {
      conversationId: conversation.id,
      userId: userBId,
    },
  });

  return conversation;
}

async function createMessage(
  conversationId,
  senderId,
  content,
  appointmentId = null,
  createdAt = null,
) {
  const message = await db.message.create({
    data: {
      conversationId,
      senderId,
      content,
      appointmentId,
      ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
    },
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: message.createdAt,
      lastMessageText: content,
    },
  });

  return message;
}

async function main() {
  const passwordHash = await hash("123456+", 10);

  const caregivers = [
    {
      user: {
        name: "Ana Paula Silva",
        email: "ana@email.com",
        phone: "38999123456",
        avatarUrl: "https://randomuser.me/api/portraits/women/49.jpg",
        birthDate: "1994-03-15",
      },
      profile: {
        bio: "Cuidadora com 6 anos de experiência e formação em pedagogia.",
        hourlyRateCents: 3500,
        city: "Montes Claros",
        state: "MG",
        experienceYears: 6,
        maxChildren: 3,
        specialties: ["bebês", "educação infantil", "primeiros socorros"],
      },
    },
    {
      user: {
        name: "Mariana Costa",
        email: "mariana@email.com",
        phone: "38999887766",
        avatarUrl: "https://randomuser.me/api/portraits/women/45.jpg",
        birthDate: "1991-08-22",
      },
      profile: {
        bio: "Especialista em atividades recreativas e desenvolvimento infantil.",
        hourlyRateCents: 4200,
        city: "Montes Claros",
        state: "MG",
        experienceYears: 8,
        maxChildren: 4,
        specialties: ["atividades recreativas", "educação infantil"],
      },
    },
    {
      user: {
        name: "Carla Mendes",
        email: "carla@email.com",
        phone: "38995556644",
        avatarUrl: "https://randomuser.me/api/portraits/women/59.jpg",
        birthDate: "1996-01-10",
      },
      profile: {
        bio: "Experiência com bebês e rotina do sono.",
        hourlyRateCents: 3000,
        city: "Montes Claros",
        state: "MG",
        experienceYears: 5,
        maxChildren: 2,
        specialties: ["bebês", "cuidados noturnos"],
      },
    },
    {
      user: {
        name: "Juliana Rocha",
        email: "juliana@email.com",
        phone: "38994443322",
        avatarUrl: "https://randomuser.me/api/portraits/women/48.jpg",
        birthDate: "1992-11-05",
      },
      profile: {
        bio: "Cuidadora com experiência com crianças autistas.",
        hourlyRateCents: 4500,
        city: "Montes Claros",
        state: "MG",
        experienceYears: 7,
        maxChildren: 3,
        specialties: ["autismo", "cuidados especiais"],
      },
    },
    {
      user: {
        name: "Fernanda Oliveira",
        email: "fernanda@email.com",
        phone: "38997778899",
        avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
        birthDate: "1997-06-28",
      },
      profile: {
        bio: "Cuidadora paciente e dedicada com experiência escolar.",
        hourlyRateCents: 3800,
        city: "Montes Claros",
        state: "MG",
        experienceYears: 4,
        maxChildren: 3,
        specialties: ["tarefas escolares", "atividades recreativas"],
      },
    },
  ];

  const parents = [
    {
      name: "Lucas Almeida",
      email: "lucas@email.com",
      phone: "38999111111",
      avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg",
      birthDate: "1976-05-14",
    },
    {
      name: "Patrícia Souza",
      email: "patricia@email.com",
      phone: "38999222222",
      avatarUrl: "https://randomuser.me/api/portraits/women/58.jpg",
      birthDate: "1975-09-03",
    },
    {
      name: "Roberto Lima",
      email: "roberto@email.com",
      phone: "38999333333",
      avatarUrl: "https://randomuser.me/api/portraits/men/41.jpg",
      birthDate: "1985-12-20",
    },
  ];

  const caregiverUsers = [];
  const parentUsers = [];

  console.log("Limpando dados relacionais...");
  await db.message.deleteMany();
  await db.conversationParticipant.deleteMany();
  await db.conversation.deleteMany();
  await db.review.deleteMany();
  await db.payment.deleteMany();
  await db.appointment.deleteMany();
  await db.caregiverWeeklyAvailability.deleteMany();
  await db.caregiverAvailabilityBlock.deleteMany();

  console.log("Criando/atualizando cuidadoras...");
  for (const caregiver of caregivers) {
    const user = await db.user.upsert({
      where: { email: caregiver.user.email },
      update: {
        name: caregiver.user.name,
        phone: caregiver.user.phone,
        avatarUrl: caregiver.user.avatarUrl,
        birthDate: toDate(caregiver.user.birthDate),
        role: "CUIDADORA",
        isActive: true,
      },
      create: {
        name: caregiver.user.name,
        email: caregiver.user.email,
        phone: caregiver.user.phone,
        avatarUrl: caregiver.user.avatarUrl,
        birthDate: toDate(caregiver.user.birthDate),
        role: "CUIDADORA",
        passwordHash,
      },
    });

    await db.caregiverProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: caregiver.profile.bio,
        hourlyRateCents: caregiver.profile.hourlyRateCents,
        city: caregiver.profile.city,
        state: caregiver.profile.state,
        experienceYears: caregiver.profile.experienceYears,
        maxChildren: caregiver.profile.maxChildren,
        specialties: caregiver.profile.specialties,
      },
      create: {
        userId: user.id,
        bio: caregiver.profile.bio,
        hourlyRateCents: caregiver.profile.hourlyRateCents,
        city: caregiver.profile.city,
        state: caregiver.profile.state,
        experienceYears: caregiver.profile.experienceYears,
        maxChildren: caregiver.profile.maxChildren,
        specialties: caregiver.profile.specialties,
      },
    });

    await db.caregiverWeeklyAvailability.createMany({
      data: [
        { caregiverId: user.id, weekday: "MON", startMin: 480, endMin: 1080 },
        { caregiverId: user.id, weekday: "TUE", startMin: 480, endMin: 1080 },
        { caregiverId: user.id, weekday: "WED", startMin: 480, endMin: 1080 },
        { caregiverId: user.id, weekday: "THU", startMin: 480, endMin: 1080 },
        { caregiverId: user.id, weekday: "FRI", startMin: 480, endMin: 1080 },
      ],
    });

    caregiverUsers.push(user);
    console.log(`Cuidadora pronta: ${user.name} email: ${user.email}`);
  }

  console.log("Criando/atualizando responsáveis...");
  for (const parent of parents) {
    const user = await db.user.upsert({
      where: { email: parent.email },
      update: {
        name: parent.name,
        phone: parent.phone,
        avatarUrl: parent.avatarUrl,
        birthDate: toDate(parent.birthDate),
        role: "RESPONSAVEL",
        isActive: true,
      },
      create: {
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        avatarUrl: parent.avatarUrl,
        birthDate: toDate(parent.birthDate),
        role: "RESPONSAVEL",
        passwordHash,
      },
    });

    parentUsers.push(user);
    console.log(`Responsável pronto: ${user.name} email: ${user.email}`);
  }

  const findParent = (email) => parentUsers.find((u) => u.email === email);
  const findCaregiver = (email) =>
    caregiverUsers.find((u) => u.email === email);

  console.log("Criando agendamentos concluídos e avaliações...");
  const completedAppointmentsSeed = [
    {
      parentEmail: "lucas@email.com",
      caregiverEmail: "ana@email.com",
      startAt: "2026-02-10T13:00:00.000Z",
      endAt: "2026-02-10T18:00:00.000Z",
      hourlyRateCents: 3500,
      totalCents: 17500,
      notes: "Cuidar de uma criança de 3 anos no período da tarde.",
      paymentMethod: "PIX",
      review: {
        rating: 5,
        comment: "Excelente profissional, muito atenciosa e pontual.",
      },
    },
    {
      parentEmail: "patricia@email.com",
      caregiverEmail: "ana@email.com",
      startAt: "2026-02-14T08:00:00.000Z",
      endAt: "2026-02-14T12:00:00.000Z",
      hourlyRateCents: 3500,
      totalCents: 14000,
      notes: "Acompanhamento durante a manhã.",
      paymentMethod: "CARD",
      review: {
        rating: 4,
        comment: "Muito cuidadosa e carinhosa com a criança.",
      },
    },
    {
      parentEmail: "roberto@email.com",
      caregiverEmail: "mariana@email.com",
      startAt: "2026-02-12T14:00:00.000Z",
      endAt: "2026-02-12T19:00:00.000Z",
      hourlyRateCents: 4200,
      totalCents: 21000,
      notes: "Atividades recreativas no período da tarde.",
      paymentMethod: "PIX",
      review: {
        rating: 5,
        comment: "Ótima didática e excelente interação com as crianças.",
      },
    },
    {
      parentEmail: "lucas@email.com",
      caregiverEmail: "carla@email.com",
      startAt: "2026-02-08T19:00:00.000Z",
      endAt: "2026-02-08T23:00:00.000Z",
      hourlyRateCents: 3000,
      totalCents: 12000,
      notes: "Cuidados noturnos.",
      paymentMethod: "PIX",
      review: {
        rating: 4,
        comment: "Foi muito bem, especialmente na rotina do sono.",
      },
    },
    {
      parentEmail: "patricia@email.com",
      caregiverEmail: "juliana@email.com",
      startAt: "2026-02-16T09:00:00.000Z",
      endAt: "2026-02-16T13:00:00.000Z",
      hourlyRateCents: 4500,
      totalCents: 18000,
      notes: "Acompanhamento especializado.",
      paymentMethod: "CARD",
      review: {
        rating: 5,
        comment: "Profissional excelente, muito preparada e paciente.",
      },
    },
    {
      parentEmail: "roberto@email.com",
      caregiverEmail: "fernanda@email.com",
      startAt: "2026-02-18T13:30:00.000Z",
      endAt: "2026-02-18T17:30:00.000Z",
      hourlyRateCents: 3800,
      totalCents: 15200,
      notes: "Apoio em atividades escolares e recreativas.",
      paymentMethod: "PIX",
      review: {
        rating: 4,
        comment: "Muito dedicada, ajudou bastante nas tarefas.",
      },
    },
  ];

  const createdCompletedAppointments = [];

  for (const item of completedAppointmentsSeed) {
    const parent = findParent(item.parentEmail);
    const caregiver = findCaregiver(item.caregiverEmail);
    if (!parent || !caregiver) continue;

    const appointment = await db.appointment.create({
      data: {
        parentId: parent.id,
        caregiverId: caregiver.id,
        status: "CONCLUIDO",
        startAt: new Date(item.startAt),
        endAt: new Date(item.endAt),
        notes: item.notes,
        hourlyRateCents: item.hourlyRateCents,
        totalCents: item.totalCents,
      },
    });

    await db.payment.create({
      data: {
        appointmentId: appointment.id,
        method: item.paymentMethod,
        status: "PAGO",
        amountCents: item.totalCents,
        provider: "seed",
        providerPaymentId: `pay_${appointment.id.slice(0, 8)}`,
        paidAt: new Date(item.endAt),
      },
    });

    await db.review.create({
      data: {
        appointmentId: appointment.id,
        authorId: parent.id,
        targetId: caregiver.id,
        rating: item.review.rating,
        comment: item.review.comment,
      },
    });

    createdCompletedAppointments.push({ appointment, parent, caregiver });
  }

  console.log("Criando agendamentos futuros prontos...");
  const futureAppointmentsSeed = [
    {
      parentEmail: "lucas@email.com",
      caregiverEmail: "ana@email.com",
      startAt: "2026-03-10T13:00:00.000Z",
      endAt: "2026-03-10T18:00:00.000Z",
      hourlyRateCents: 3500,
      totalCents: 17500,
      notes: "Agendamento futuro para o período da tarde.",
      status: "CONFIRMADO",
      paymentMethod: "PIX",
      paymentStatus: "PAGO",
    },
    {
      parentEmail: "patricia@email.com",
      caregiverEmail: "mariana@email.com",
      startAt: "2026-03-12T14:00:00.000Z",
      endAt: "2026-03-12T19:00:00.000Z",
      hourlyRateCents: 4200,
      totalCents: 21000,
      notes: "Agendamento confirmado para recreação infantil.",
      status: "CONFIRMADO",
      paymentMethod: "CARD",
      paymentStatus: "PAGO",
    },
    {
      parentEmail: "roberto@email.com",
      caregiverEmail: "carla@email.com",
      startAt: "2026-03-14T19:00:00.000Z",
      endAt: "2026-03-14T23:00:00.000Z",
      hourlyRateCents: 3000,
      totalCents: 12000,
      notes: "Agendamento pendente para período noturno.",
      status: "PENDENTE",
      paymentMethod: "PIX",
      paymentStatus: "PENDENTE",
    },
    {
      parentEmail: "lucas@email.com",
      caregiverEmail: "fernanda@email.com",
      startAt: "2026-03-15T13:30:00.000Z",
      endAt: "2026-03-15T17:30:00.000Z",
      hourlyRateCents: 3800,
      totalCents: 15200,
      notes: "Agendamento futuro para apoio escolar.",
      status: "CONFIRMADO",
      paymentMethod: "PIX",
      paymentStatus: "PAGO",
    },
  ];

  const createdFutureAppointments = [];

  for (const item of futureAppointmentsSeed) {
    const parent = findParent(item.parentEmail);
    const caregiver = findCaregiver(item.caregiverEmail);
    if (!parent || !caregiver) continue;

    const appointment = await db.appointment.create({
      data: {
        parentId: parent.id,
        caregiverId: caregiver.id,
        status: item.status,
        startAt: new Date(item.startAt),
        endAt: new Date(item.endAt),
        notes: item.notes,
        hourlyRateCents: item.hourlyRateCents,
        totalCents: item.totalCents,
      },
    });

    await db.payment.create({
      data: {
        appointmentId: appointment.id,
        method: item.paymentMethod,
        status: item.paymentStatus,
        amountCents: item.totalCents,
        provider: "seed",
        providerPaymentId: `pay_${appointment.id.slice(0, 8)}`,
        ...(item.paymentStatus === "PAGO"
          ? { paidAt: new Date(item.startAt) }
          : {}),
      },
    });

    createdFutureAppointments.push({ appointment, parent, caregiver });
  }

  console.log("Criando conversas e mensagens...");
  const chatPairs = [
    {
      parentEmail: "lucas@email.com",
      caregiverEmail: "ana@email.com",
      messages: [
        {
          sender: "parent",
          content:
            "Olá Ana, gostei do seu perfil. Você tem disponibilidade esta semana?",
          createdAt: "2026-03-01T10:00:00.000Z",
        },
        {
          sender: "caregiver",
          content: "Olá! Tenho sim, principalmente no período da tarde.",
          createdAt: "2026-03-01T10:08:00.000Z",
        },
        {
          sender: "parent",
          content: "Perfeito, vou fechar um agendamento com você.",
          createdAt: "2026-03-01T10:15:00.000Z",
        },
      ],
    },
    {
      parentEmail: "patricia@email.com",
      caregiverEmail: "mariana@email.com",
      messages: [
        {
          sender: "parent",
          content:
            "Oi Mariana, você trabalha com atividades recreativas para crianças de 5 anos?",
          createdAt: "2026-03-02T09:20:00.000Z",
        },
        {
          sender: "caregiver",
          content:
            "Sim, trabalho sim. Posso montar atividades adequadas para a idade.",
          createdAt: "2026-03-02T09:27:00.000Z",
        },
      ],
    },
    {
      parentEmail: "roberto@email.com",
      caregiverEmail: "carla@email.com",
      messages: [
        {
          sender: "parent",
          content: "Boa noite, preciso de uma babá para sábado à noite.",
          createdAt: "2026-03-03T18:30:00.000Z",
        },
      ],
    },
  ];

  for (const pair of chatPairs) {
    const parent = findParent(pair.parentEmail);
    const caregiver = findCaregiver(pair.caregiverEmail);
    if (!parent || !caregiver) continue;

    const relatedAppointment =
      createdFutureAppointments.find(
        (a) => a.parent.id === parent.id && a.caregiver.id === caregiver.id,
      ) ||
      createdCompletedAppointments.find(
        (a) => a.parent.id === parent.id && a.caregiver.id === caregiver.id,
      );

    const conversation = await upsertConversationWithParticipants(
      parent.id,
      caregiver.id,
      relatedAppointment?.appointment.id || null,
    );

    for (const msg of pair.messages) {
      const senderId = msg.sender === "parent" ? parent.id : caregiver.id;
      await createMessage(
        conversation.id,
        senderId,
        msg.content,
        relatedAppointment?.appointment.id || null,
        msg.createdAt,
      );
    }

    await db.conversationParticipant.updateMany({
      where: {
        conversationId: conversation.id,
        userId: caregiver.id,
      },
      data: {
        lastReadAt: new Date("2026-03-03T19:00:00.000Z"),
      },
    });

    await db.conversationParticipant.updateMany({
      where: {
        conversationId: conversation.id,
        userId: parent.id,
      },
      data: {
        lastReadAt: new Date("2026-03-03T19:05:00.000Z"),
      },
    });
  }

  console.log("Atualizando notas das cuidadoras...");
  for (const caregiver of caregiverUsers) {
    const reviews = await db.review.findMany({
      where: { targetId: caregiver.id },
      select: { rating: true },
    });

    const ratingCount = reviews.length;
    const ratingAvg =
      ratingCount > 0
        ? reviews.reduce((acc, item) => acc + item.rating, 0) / ratingCount
        : 0;

    await db.caregiverProfile.update({
      where: { userId: caregiver.id },
      data: {
        ratingCount,
        ratingAvg,
      },
    });
  }

  console.log("Seed finalizado com sucesso.");
  console.log("Senha padrão dos usuários: 123456+");
}

main()
  .catch((e) => {
    console.error("Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
