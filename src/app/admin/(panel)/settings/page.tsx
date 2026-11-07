import { requireAdmin } from "@/lib/auth";
import { mapSettings } from "@/lib/data/settings";
import { isTelegramConfigured } from "@/lib/telegram";
import { Card, PageTitle } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/ActionButton";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { sendTelegramTest } from "../../actions";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const tg = isTelegramConfigured();

  return (
    <>
      <PageTitle title="Настройки" />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <SettingsForm settings={mapSettings(data)} />
        <Card className="h-fit">
          <h2 className="font-bold">Telegram-уведомления</h2>
          <p className={`mt-2 text-sm ${tg ? "text-olive-300" : "text-terracotta-400"}`}>{tg ? "Подключены" : "Не настроены"}</p>
          <p className="mt-3 text-sm leading-relaxed text-cream/60">
            Токен бота и ID чата хранятся только в переменных окружения сервера (<code className="text-cream/80">TELEGRAM_BOT_TOKEN</code>, <code className="text-cream/80">TELEGRAM_CHAT_ID</code>) — так их нельзя украсть через сайт. Изменить их можно в настройках Vercel → Environment Variables, затем сделать Redeploy.
          </p>
          <div className="mt-4">
            <ActionButton action={sendTelegramTest}>Отправить тестовое сообщение</ActionButton>
          </div>
        </Card>
      </div>
    </>
  );
}
