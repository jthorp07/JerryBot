import { AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction, RoleSelectMenuBuilder, SlashCommandBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js"

export enum ICommandPermission {
    ALL,
    SERVER_OWNER,
    BOT_ADMIN
}

export type ICommandExecute = (interaction: ChatInputCommandInteraction) => Promise<void>
export type ICommand = {
    data: SlashCommandBuilder,
    execute: ICommandExecute,
    permissions: ICommandPermission
}

export type ISelectMenuExecute = (interaction: AnySelectMenuInteraction, idArgs: String[]) => Promise<void>;
export type ISelectMenu = {
    customId: String,
    execute: ISelectMenuExecute,
    permissions: ICommandPermission,
    selectMenu: (... args: any[]) => RoleSelectMenuBuilder | UserSelectMenuBuilder | StringSelectMenuBuilder | ChannelSelectMenuBuilder
}

export type IButtonExecute = (interaction: ButtonInteraction, idArgs: String[]) => Promise<void>;
export type IButton = {
    customId: String,
    execute: IButtonExecute,
    permissions: ICommandPermission,
    button: (... args: any[]) => ButtonBuilder
}

export type IModalExecute = (interaction: ModalSubmitInteraction, idArgs: String[]) => Promise<void>;
export type IModal = {
    customId: String,
    execute: IModalExecute,
    modal: (... args: any[]) => ModalBuilder
}
