const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Guarda los teams en memoria
let teams = {};

client.on("ready", () => {
  console.log(`Bot encendido como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(" ");

  // CREAR TEAM
  if (args[0] === "!team" && args[1] === "crear") {
    const nombre = args.slice(2).join(" ");
    if (!nombre) return message.reply("Pon un nombre al team");

    if (teams[message.author.id]) {
      return message.reply("Ya tienes un team creado");
    }

    const rol = await message.guild.roles.create({
      name: nombre,
      color: "Random"
    });

    await message.member.roles.add(rol);

    const canal = await message.guild.channels.create({
      name: nombre,
      type: 0,
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: rol.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    teams[message.author.id] = {
      rolId: rol.id,
      canalId: canal.id
    };

    message.reply(`Team **${nombre}** creado 🔥`);
  }

  // AÑADIR MIEMBRO
  if (args[0] === "!team" && args[1] === "add") {
    const user = message.mentions.members.first();
    if (!user) return message.reply("Menciona a alguien");

    const team = teams[message.author.id];
    if (!team) return message.reply("No tienes team");

    const rol = message.guild.roles.cache.get(team.rolId);

    await user.roles.add(rol);

    message.reply(`${user.user.tag} añadido al team ✅`);
  }

  // QUITAR MIEMBRO
  if (args[0] === "!team" && args[1] === "remove") {
    const user = message.mentions.members.first();
    if (!user) return message.reply("Menciona a alguien");

    const team = teams[message.author.id];
    if (!team) return message.reply("No tienes team");

    const rol = message.guild.roles.cache.get(team.rolId);

    await user.roles.remove(rol);

    message.reply(`${user.user.tag} eliminado del team ❌`);
  }

  // ELIMINAR TEAM
  if (args[0] === "!team" && args[1] === "delete") {
    const team = teams[message.author.id];
    if (!team) return message.reply("No tienes team");

    const rol = message.guild.roles.cache.get(team.rolId);
    const canal = message.guild.channels.cache.get(team.canalId);

    if (rol) await rol.delete();
    if (canal) await canal.delete();

    delete teams[message.author.id];

    message.reply("Team eliminado 💥");
  }
});

client.loginclient.login(process.env.TOKEN);


