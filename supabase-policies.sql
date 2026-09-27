-- =========================================================
-- MAZALLI PISCINAS
-- POLICIES DO SUPABASE
--
-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- O site público continua podendo ler os projetos.
-- Apenas usuários autenticados poderão gerenciar projetos/imagens.
-- =========================================================

alter table public.projetos enable row level security;

drop policy if exists "Projetos públicos - leitura" on public.projetos;
create policy "Projetos públicos - leitura"
on public.projetos
for select
to anon, authenticated
using (true);

drop policy if exists "Projetos - inserir autenticado" on public.projetos;
create policy "Projetos - inserir autenticado"
on public.projetos
for insert
to authenticated
with check (true);

drop policy if exists "Projetos - atualizar autenticado" on public.projetos;
create policy "Projetos - atualizar autenticado"
on public.projetos
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Projetos - excluir autenticado" on public.projetos;
create policy "Projetos - excluir autenticado"
on public.projetos
for delete
to authenticated
using (true);

drop policy if exists "Imagens de piscinas - leitura pública" on storage.objects;
create policy "Imagens de piscinas - leitura pública"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'piscinas');

drop policy if exists "Imagens de piscinas - upload autenticado" on storage.objects;
create policy "Imagens de piscinas - upload autenticado"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'piscinas');

drop policy if exists "Imagens de piscinas - atualização autenticada" on storage.objects;
create policy "Imagens de piscinas - atualização autenticada"
on storage.objects
for update
to authenticated
using (bucket_id = 'piscinas')
with check (bucket_id = 'piscinas');

drop policy if exists "Imagens de piscinas - exclusão autenticada" on storage.objects;
create policy "Imagens de piscinas - exclusão autenticada"
on storage.objects
for delete
to authenticated
using (bucket_id = 'piscinas');
