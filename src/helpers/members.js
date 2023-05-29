const { Client } = require("pg")
const { UltronGuild, UltronRole, UltronMember } = require("../database/ultron_sequelize")
const RolesHelper = require("./roles")
const GuildHelper = require("./guilds")
const { fetchRoles } = require("./roles")

var ultronMembers = null

module.exports = {

    async setup(client) {
        console.log("Setting up Members")
        await this.load_to_db(client)
        console.log("Finished setting up Members")
    },

    async load_to_db(client) {

        guilds = client.guilds.cache
        for (guild of guilds) {
            guildId = guild[1].id
            ultronguild = await UltronGuild.findOne({
                where:
                {
                    clientId: client.id,
                    guildId: guildId
                }
            })

            members = await guild[1].members.fetch()
            memberIds = Array.from(members.keys())
            for (member of members) {
                memberId = member[1].id
                memberDisplayName = member[1].displayName

                ultronmember = await UltronMember.upsert({
                    memberId: member[1].id,
                    displayName: member[1].displayName
                })

                ultronmember = ultronmember[0]

                await ultronmember.addUltronGuild(ultronguild)
                
                roles = member[1].roles.cache
                for (role of roles) {
                    roleId = role[1].id
                    ultronrole = await UltronRole.findOne({
                        where:
                        {
                            UltronGuildId: ultronguild.id,
                            roleId: roleId
                        }
                    })
                    await ultronmember.addUltronRole(ultronrole)
                }

                roleKeys = Array.from(roles.keys())

                for (const memberRole of await this.fetchMemberRoles(client, guildId, memberId)) {
                    roleId = memberRole.roleId

                    if (!(roleKeys.includes(roleId))) {
                        console.log(`Remove role '${roleId}'`)

                        if (await this.memberRemoveRole(client, guildId, memberId, roleId)) {
                            console.log(`Role '${roleId}' removed successfully`)
                        } else { console.log(`Role '${roleId}' NOT removed successfully`) }
                    }
                }
            }

            dbguildmembers = await this.fetchMembers(client, guildId, true)

            for (member of dbguildmembers) {
                if (!(memberIds.includes(member.memberId))) {
                    console.log(`Remove Member ${member.memberId}`)
                    await this.memberRemoveGuildMember(client, guildId, member.memberId)
                }
            }
        }

    },
    async fetchMembers(client, guildId = null, force = false) {
        if (!ultronMembers || force) {
            ultronMembers = await UltronMember.findAll({ include: [UltronGuild, UltronRole] })
        }

        if (guildId) {
            retMembers = ultronMembers.filter((member) => {
                memberGuilds = member.UltronGuilds.filter(guild => {
                    return (guild.clientId == client.id && guild.guildId == guildId)
                })

                return memberGuilds.length > 0
            })
            return retMembers
        }
        return ultronMembers
    },

    async fetchMember(client, memberId) {
        if (!ultronMembers) await this.fetchMembers(client);

        member = ultronMembers.filter(fmember => fmember.memberId == memberId)

        if (member.length < 1) {
            //If can't find member, force a cache refresh and try again
            await this.fetchMembers(client, null, true)

            member = ultronMembers.filter(fmember => fmember.memberId == memberId)

            //If still not found, then member does not exist
            if (member.length < 1) return null;
        }

        return member[0]
    },

    async fetchMemberPrivileges(client, guildId, memberId) {
        if (!ultronMembers) await this.fetchMembers(client);

        member = await this.fetchMember(client, memberId)

        if (!member) return [];

        memberprivileges = []

        for (const role of member.UltronRoles) {
            frole = await RolesHelper.fetchRole(client, guildId, role.roleId)

            if (frole) {
                frole.UltronPrivileges.forEach(priv => {
                    filtered = memberprivileges.filter(fpriv => fpriv.id == priv.id)
                    if (filtered.length <= 0) {
                        memberprivileges.push(priv)
                    }
                })
            }
        }

        return memberprivileges
    },

    async memberHasPrivilege(client, guildId, memberId, privId) {

        memberprivileges = await this.fetchMemberPrivileges(client, guildId, memberId)

        priv = memberprivileges.filter(fpriv => fpriv.id == privId)

        return (priv.length >= 1)
    },

    async fetchMemberRoles(client, guildId, memberId) {
        await this.fetchMembers(client);

        guild = await GuildHelper.fetchGuild(client, guildId)
        member = await this.fetchMember(client, memberId)

        if (!member) {
            console.log(`Member: '${memberId}' not found!`)
            return [];
        }

        roles = member.UltronRoles.filter(frole => frole.UltronGuildId == guild.id)

        return roles
    },

    async memberHasRole(client, guildId, memberId, roleId) {

        memberroles = await this.fetchMemberRoles(client, guildId, memberId)

        // console.log(`memberHasRole -> memberroles: `)
        // console.log(memberroles)

        role = memberroles.filter(frole => frole.roleId == roleId)

        return (role.length >= 1)
    },

    async memberAddRole(client, guildId, memberId, roleId) {
        member = await this.fetchMember(client, memberId)

        if (member === null) {
            console.log(`Member ${memberId} not found!`)
            return false
        }

        role = await RolesHelper.fetchRole(client, guildId, roleId)

        if (role === null) {
            console.log(`Role ${roleId} not found!`)
            return false
        }

        await member.addUltronRole(role)

        //refresh cache?
        await this.fetchMembers(client, null, true)

        return true;
    },

    async memberRemoveRole(client, guildId, memberId, roleId) {
        member = await this.fetchMember(client, memberId)

        if (member === null) {
            return false
        }

        role = await RolesHelper.fetchRole(client, guildId, roleId)

        if (role === null) {
            return false
        }

        await member.removeUltronRole(role)

        await this.fetchMembers(client, null, true)

        return true;
    },

    async memberRemoveGuildMember(client, guildId, memberId) {
        console.log(`Removing Guild Member ${memberId}`)

        member = this.fetchMember(client, memberId)

        guild = await GuildHelper.fetchGuild(client, guildId)

        roles = await this.fetchMemberRoles(client, guildId, memberId)

        for (const role in roles) {
            await member.removeUltronRole(role)
        }

        await member.removeUltronGuild(guild)

        //Fully refresh cache
        await GuildHelper.fetchGuilds(client, null, true)
        await RolesHelper.fetchRoles(client, null, true)
        await this.fetchMembers(client, null, true)

        return true
    },

    async memberAddGuildMember(client, guildId, memberId, displayName) {
        console.log(`Adding Guild Member ${memberId}`)
        member = await UltronMember.upsert({
            memberId: memberId,
            displayName: displayName
        })

        member = member[0]

        guild = await GuildHelper.fetchGuild(client, guildId)
        role = await RolesHelper.fetchRole(client, guildId, guildId)

        await member.addUltronGuild(guild)
        await member.addUltronRole(role)

        await this.fetchMembers(client, null, true)
        await GuildHelper.fetchGuilds(client, null, true)
        await RolesHelper.fetchRoles(client, null, true)

    },

}