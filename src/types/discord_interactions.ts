import { AnySelectMenuInteraction, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction, RoleSelectMenuBuilder, SlashCommandBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js"
import { JerryError } from "./jerry_error";

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

export type ISelectMenuExecute = (interaction: AnySelectMenuInteraction, idArgs: string[]) => Promise<void>;
export type ISelectMenu = {
    customId: string,
    execute: ISelectMenuExecute,
    permissions: ICommandPermission,
    selectMenu: (... args: any[]) => RoleSelectMenuBuilder | UserSelectMenuBuilder | StringSelectMenuBuilder | ChannelSelectMenuBuilder | JerryError
}

export type IButtonExecute = (interaction: ButtonInteraction, idArgs: string[]) => Promise<void>;
export type IButton = {
    customId: string,
    execute: IButtonExecute,
    permissions: ICommandPermission,
    button: (... args: any[]) => ButtonBuilder | JerryError
}

export type IModalExecute = (interaction: ModalSubmitInteraction, idArgs: string[]) => Promise<void>;
export type IModal = {
    customId: string,
    execute: IModalExecute,
    modal: (... args: any[]) => ModalBuilder | JerryError
}
