import * as Discord from 'discord.js';

exports.run = async (client, msg, args, prefix, settings) => {
	  if(!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.channel.send("🛑 당신은 관리자 권한이 없습니다.");
	  if(!msg.guild.me.hasPermission(["MANAGE_MESSAGES", "ADMINISTRATOR"])) return msg.channel.send("🛑 봇권한중에 관리자 권한이 없습니다")
        if (!msg.mentions.users.first()) return msg.channel.send('뮤트할 유저를 멘션해주세요');
        if (!msg.guild.member(msg.mentions.users.first())) return msg.channel.send('이 유저는 서버에 없는 것 같아요.');
        if (!msg.guild.member(msg.mentions.users.first()).roles.cache.has(settings.mutedRole)) return msg.channel.send('이 유저는 뮤트 당한적이 없네요.');
        const embed = new Discord.MessageEmbed()
            .setTitle('멤버를 뮤트해제 할까요?')
            .setColor('#ffff00')
            .addField('뮤트해제할 멤버', msg.mentions.users.first().toString())
            .addField('뮤트해제한 이유', args.slice(2).join(' ') || '없음')
            .setFooter(msg.author.tag, msg.author.displayAvatarURL())
            .setTimestamp();
        let m = await client.channels.cache.get(msg.channel.id).send({
            embed: embed
        });
        await m.react('✅');
        await m.react('❌');
        const filter = (r, u) => u.id == msg.author.id && (r.emoji.name == '✅' || r.emoji.name == '❌');
        const collector = m.createReactionCollector(filter, {
            max: 1
        });
        collector.on('end', async collected => {
            if (collected.first().emoji.name == '✅') {
                msg.mentions.users.first().send({
                    embed: new Discord.MessageEmbed()
                        .setTitle(`${msg.guild.name}에서 뮤트해제되었어요`)
                        .setColor('RED')
                        .addField('뮤트해제 이유', args.slice(2).join(' ') || '없음')
                        .addField('뮤트해제한 유저', msg.author.tag)
                        .setFooter(msg.author.tag, msg.author.displayAvatarURL())
                        .setTimestamp()
                });
                await msg.guild.member(msg.mentions.users.first()).roles.remove(settings.mutedRole)
                await msg.guild.member(msg.mentions.users.first()).roles.add(settings.userRole)
                embed.setTitle('멤버가 뮤트해제되었어요')
                    .setColor('RED')
                    .spliceFields(0, 1, {
                        name: '뮤트해제한 멤버',
                        value: msg.mentions.users.first().toString()
                    })
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            } else {
                embed.setTitle('멤버 뮤트해재를  취소되었어요')
                    .setColor('GREEN')
                    .setTimestamp()
                await m.edit({
                    embed: embed
                });
            }
        })
};

exports.config = {
  name: "언뮤트",
  aliases: ["ㅡㅕㅅㄷ", "unmute"],
  category: ["관리"],
  des: ["유저에게 채팅 칠수 있게 입을 열어 버립니다."],
  use: ["//언뮤트 <유저> <사유> "]
};