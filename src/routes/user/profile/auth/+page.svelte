<script lang="ts">
  import { superForm } from "sveltekit-superforms/client";
  import { zod } from "sveltekit-superforms/adapters";

  import * as utils from "$lib/utils";
  import LL from "$i18n/i18n-svelte";
  import {
    userFullSchema,
    type UserWritableSchema,
    userWritableSchema,
    type UserWritableSchemaKey,
  } from "$lib/schemas/user/user";
  import type { FormFieldsetInfo } from "$lib/schemas/form";
  import { changePasswordSchema } from "$lib/schemas/user/changePassword";

  let { data } = $props();

  const { form, errors, message, tainted, isTainted, enhance } = superForm(data.form, {
    validators: zod(userFullSchema),
    resetForm: false,
  });
  const {
    form: changePasswordForm,
    errors: changePasswordErrors,
    enhance: changePasswordEnhance,
    message: changePasswordMessage,
  } = superForm(data.changePasswordForm, {
    validators: zod(changePasswordSchema),
    resetForm: false,
  });
  type ExcludePublicKeys<T extends string> = T extends `${infer Prefix}_public` ? never : T;

  const changePasswordFieldKeys = ["old_password", "new_password"] as const;
  // const fieldsets: FormInfo<
  //   Exclude<keyof TranslationFunctions["user"]["functions"]["profile"], "title">,
  //   Exclude<ExcludePublicKeys<UserWritableSchemaKey>, "avatar_file">
  // > = [
  //   {
  //     title: "info",
  //     fields: [
  //       { fieldKey: "nickname" },
  //       { fieldKey: "real_name" },
  //       { fieldKey: "gender" },
  //       { fieldKey: "birthday" },
  //       { fieldKey: "identity" },
  //     ],
  //   },
  //   {
  //     title: "auth_info",
  //     fields: [{ fieldKey: "username" }, { fieldKey: "email" }, { fieldKey: "phone_no" }],
  //   },
  // ];
  const mainFields: FormFieldsetInfo<"username" | "email" | "phone_no"> = [
    { fieldKey: "username" },
    { fieldKey: "email" },
    { fieldKey: "phone_no" },
  ];

  type BooleanKeys<T> = {
    [K in keyof T]: T[K] extends boolean ? K : never;
  }[keyof T];

  const publicFieldKeyWorkaround = (fieldKey: UserWritableSchemaKey) => {
    return `${fieldKey}_public` as BooleanKeys<UserWritableSchema>;
  };
</script>

<form method="POST" action="info" use:enhance>
  <fieldset class="fieldset bg-base-200 rounded-box mb-6 p-4">
    <legend class="fieldset-legend">{$LL.user.functions.profile.auth_info.title()}</legend>
    {#each mainFields as field}
      <label class="fieldset-label" for="input-{field.fieldKey}">
        {$LL.user[field.fieldKey]()} *
      </label>
      <input
        class="input w-full {$errors[field.fieldKey] ? 'input-error' : ''}"
        id="input-{field.fieldKey}"
        name={field.fieldKey}
        type={field.fieldKey === "phone_no" ? "tel" : "text"}
        bind:value={$form[field.fieldKey]}
        placeholder={$LL.user[field.fieldKey]()}
        aria-invalid={$errors[field.fieldKey] ? "true" : "false"}
      />
      <div class="flex items-start gap-2">
        <p class="fieldset-label flex-1 {$errors[field.fieldKey] ? 'text-error' : ''}">
          {#if $errors[field.fieldKey]}
            {#each $errors[field.fieldKey] || [] as error}
              <!-- “|| []” 用于规避 svelte 语言服务器的报错 -->
              {utils.getValidationTranslatedStringByKey($LL, error, field.fieldKey, "user")}<br />
            {/each}
          {:else if ($tainted === undefined || !isTainted($tainted[field.fieldKey])) && ((field.fieldKey === "email" && !$form.is_email_verified) || (field.fieldKey === "phone_no" && !$form.is_phone_verified))}
            <span class="text-warning">{$LL.user[field.fieldKey]()}{$LL.user.unverified()}</span>
          {:else}
            &nbsp;
          {/if}
        </p>
        {#if Object.keys(userWritableSchema.shape).includes(`${field.fieldKey}_public`)}
          <label>
            <input
              type="checkbox"
              class="checkbox"
              id="{field.fieldKey}-public"
              name="{field.fieldKey}_public"
              bind:checked={$form[publicFieldKeyWorkaround(field.fieldKey)]}
            />
            {$LL.user.public()}
          </label>
        {/if}
      </div>
    {/each}
    <p class="fieldset-label text-error">
      {#if $message}
        {utils.getValidationTranslatedStringByKey($LL, $message, undefined, "user")}
      {/if}
    </p>
    <button class="btn btn-primary justify-self-start" type="submit">
      {$LL.common.submit()}
    </button>
  </fieldset>
</form>

<form method="POST" action="?/changePassword" use:changePasswordEnhance>
  <fieldset class="fieldset bg-base-200 rounded-box mb-6 p-4">
    <legend class="fieldset-legend"
      >{$LL.user.functions.profile.auth_info.change_password.title()}</legend
    >
    {#each changePasswordFieldKeys as fieldKey}
      <label class="fieldset-label" for="input-change-password-{fieldKey}">
        {$LL.user[fieldKey]()} *
      </label>
      <input
        class="input w-full {$changePasswordErrors[fieldKey] ? 'input-error' : ''}"
        id="input-change-password-{fieldKey}"
        name={fieldKey}
        type="password"
        bind:value={$changePasswordForm[fieldKey]}
        placeholder={$LL.user[fieldKey]()}
        aria-invalid={$changePasswordErrors[fieldKey] ? "true" : "false"}
      />
      <p class="fieldset-label {$changePasswordErrors[fieldKey] ? 'text-error' : ''}">
        {#if $changePasswordErrors[fieldKey]}
          {#each $changePasswordErrors[fieldKey] || [] as error}
            <!-- “|| []” 用于规避 svelte 语言服务器的报错 -->
            {utils.getValidationTranslatedStringByKey($LL, error, fieldKey, "user")}<br />
          {/each}
        {:else}
          &nbsp;
        {/if}
      </p>
    {/each}
    <p class="fieldset-label text-error">
      {#if $changePasswordMessage}
        {utils.getValidationTranslatedStringByKey($LL, $changePasswordMessage, undefined, "user")}
      {/if}
    </p>
    <button class="btn btn-primary justify-self-start" type="submit">
      {$LL.user.functions.profile.auth_info.change_password.submit()}
    </button>
  </fieldset>
</form>
