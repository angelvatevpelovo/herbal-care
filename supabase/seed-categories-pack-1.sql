-- Herbal Care categories pack 1.
-- Educational content only. Not medical advice.

insert into public.categories (slug, name, description) values
(
  'san-i-relaks',
  'Сън и релакс',
  'Образователна категория за билки, които традиционно се използват в спокойни вечерни ритуали. Не замества лекарска консултация при продължителни нарушения на съня.'
),
(
  'stres-i-balans',
  'Стрес и баланс',
  'Образователна категория за растения, които може да се свързват с рутини за спокойствие и баланс. При силна тревожност или влошаване потърсете специалист.'
),
(
  'energia-i-tonus',
  'Енергия и тонус',
  'Може да включва билки, храни и добавки, които традиционно се използват за общ тонус. Постоянната умора изисква медицинска оценка.'
),
(
  'koncentratsia',
  'Концентрация',
  'Образователна категория за растения и напитки, традиционно свързвани с фокус и бодрост. Не замества лекарска консултация при продължителни оплаквания.'
),
(
  'garlo-i-usta',
  'Гърло и уста',
  'Може да включва билки, които традиционно се използват за гаргари, чайове и устна хигиена. При силна болка, температура или кървене потърсете лекар.'
),
(
  'nos-i-sinusi',
  'Нос и синуси',
  'Образователна категория за сезонен носен комфорт и ароматни практики. При задух, висока температура или влошаване потърсете медицинска помощ.'
),
(
  'stavi-i-muskuli',
  'Стави и мускули',
  'Може да включва билки и външни практики, традиционно използвани за общ телесен комфорт. Силна болка, оток или травма изискват лекар.'
),
(
  'urinaren-komfort',
  'Уринарен комфорт',
  'Образователна категория за растения, свързани с отделителен комфорт. Болка, температура, кръв или симптоми при дете изискват лекарска консултация.'
),
(
  'cheren-drob-detoks-podkrepa',
  'Черен дроб и детокс подкрепа',
  'Може да включва билки, традиционно използвани в пролетни и храносмилателни рутини. Не замества лекарска консултация при чернодробни или жлъчни проблеми.'
),
(
  'kosa',
  'Коса',
  'Образователна категория за външна и обща грижа за коса. Косопад, рани, сърбеж или силно раздразнение изискват консултация със специалист.'
),
(
  'ventsi-i-ustna-higiena',
  'Венци и устна хигиена',
  'Може да включва билки, традиционно използвани за гаргари и външна устна грижа. Кървене, оток, болка или продължителен проблем изискват стоматолог.'
),
(
  'sezonna-grizha',
  'Сезонна грижа',
  'Образователна категория за растения, традиционно използвани през студени сезони. Не замества лекарска консултация при висока температура или влошаване.'
),
(
  'podpravki-i-aromatni-rastenia',
  'Подправки и ароматни растения',
  'Може да включва кулинарни растения и ароматни билки, традиционно използвани в храна и чайове. Концентрираните масла изискват особено внимание.'
),
(
  'adaptogeni',
  'Адаптогени',
  'Образователна категория за растения, традиционно свързвани с устойчивост към напрежение. Може да имат взаимодействия и не заместват лекарска консултация.'
),
(
  'vanshna-upotreba',
  'Външна употреба',
  'Може да включва билки и ароматни суровини, традиционно използвани върху кожа или за гаргари. При рани, инфекции или алергии потърсете лекар.'
),
(
  'antioksidantna-podkrepa',
  'Антиоксидантна подкрепа',
  'Образователна категория за храни, плодове и растения, традиционно свързвани с обща хранителна подкрепа. Не замества балансирано хранене или лекар.'
),
(
  'metabolitna-podkrepa',
  'Метаболитна подкрепа',
  'Може да включва растения и подправки, използвани като част от хранителни навици. При диабет или метаболитни заболявания е нужна лекарска консултация.'
),
(
  'mazhko-zdrave',
  'Мъжко здраве',
  'Образователна категория за теми, свързани с тонус и обща грижа. Не замества лекарска консултация при болка, уринарни симптоми или сексуални проблеми.'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.herb_categories (herb_id, category_id)
select herbs.id, categories.id
from (
  values
    ('layka', 'san-i-relaks'),
    ('layka', 'garlo-i-usta'),
    ('matochina', 'san-i-relaks'),
    ('matochina', 'stres-i-balans'),
    ('lavandula', 'san-i-relaks'),
    ('lavandula', 'stres-i-balans'),
    ('valeriana', 'san-i-relaks'),
    ('valeriana', 'stres-i-balans'),
    ('pasiflora', 'san-i-relaks'),
    ('pasiflora', 'stres-i-balans'),
    ('dyavolska-usta', 'stres-i-balans'),
    ('ashvaganda', 'adaptogeni'),
    ('ashvaganda', 'stres-i-balans'),
    ('rodiola', 'adaptogeni'),
    ('rodiola', 'energia-i-tonus'),
    ('zhenshen', 'adaptogeni'),
    ('zhenshen', 'energia-i-tonus'),
    ('astragal', 'adaptogeni'),
    ('astragal', 'sezonna-grizha'),
    ('tulsi', 'adaptogeni'),
    ('tulsi', 'stres-i-balans'),
    ('gotu-kola', 'koncentratsia'),
    ('gotu-kola', 'stres-i-balans'),
    ('ginko-biloba', 'koncentratsia'),
    ('zelen-chay', 'koncentratsia'),
    ('zelen-chay', 'antioksidantna-podkrepa'),
    ('matcha', 'koncentratsia'),
    ('matcha', 'antioksidantna-podkrepa'),
    ('yerba-mate', 'energia-i-tonus'),
    ('yerba-mate', 'koncentratsia'),
    ('maka', 'energia-i-tonus'),
    ('maka', 'mazhko-zdrave'),
    ('moringa', 'energia-i-tonus'),
    ('moringa', 'antioksidantna-podkrepa'),
    ('spirulina', 'energia-i-tonus'),
    ('spirulina', 'antioksidantna-podkrepa'),
    ('hlorela', 'antioksidantna-podkrepa'),
    ('kakao', 'stres-i-balans'),
    ('kakao', 'antioksidantna-podkrepa'),
    ('hibiskus', 'antioksidantna-podkrepa'),
    ('shipka', 'antioksidantna-podkrepa'),
    ('shipka', 'sezonna-grizha'),
    ('borovinka', 'antioksidantna-podkrepa'),
    ('chernitsa-list', 'metabolitna-podkrepa'),
    ('borovinka', 'metabolitna-podkrepa'),
    ('kanela', 'podpravki-i-aromatni-rastenia'),
    ('kanela', 'metabolitna-podkrepa'),
    ('kardamon', 'podpravki-i-aromatni-rastenia'),
    ('karamfil', 'podpravki-i-aromatni-rastenia'),
    ('dafinov-list', 'podpravki-i-aromatni-rastenia'),
    ('cheren-piper', 'podpravki-i-aromatni-rastenia'),
    ('byal-piper', 'podpravki-i-aromatni-rastenia'),
    ('shafran', 'podpravki-i-aromatni-rastenia'),
    ('vaniliya', 'podpravki-i-aromatni-rastenia'),
    ('bosilek', 'podpravki-i-aromatni-rastenia'),
    ('koriandar', 'podpravki-i-aromatni-rastenia'),
    ('anason', 'podpravki-i-aromatni-rastenia'),
    ('rezene', 'podpravki-i-aromatni-rastenia'),
    ('kopar', 'podpravki-i-aromatni-rastenia'),
    ('kimion', 'podpravki-i-aromatni-rastenia'),
    ('gradinski-chay', 'garlo-i-usta'),
    ('gradinski-chay', 'ventsi-i-ustna-higiena'),
    ('smradlika', 'ventsi-i-ustna-higiena'),
    ('smradlika', 'vanshna-upotreba'),
    ('mashterka', 'garlo-i-usta'),
    ('mashterka', 'sezonna-grizha'),
    ('byal-oman', 'sezonna-grizha'),
    ('podbel', 'sezonna-grizha'),
    ('iglika', 'sezonna-grizha'),
    ('lipa', 'sezonna-grizha'),
    ('lipa', 'san-i-relaks'),
    ('islandski-lishey', 'garlo-i-usta'),
    ('lopen', 'garlo-i-usta'),
    ('evkalipt', 'nos-i-sinusi'),
    ('evkalipt', 'sezonna-grizha'),
    ('mirta', 'nos-i-sinusi'),
    ('niauli', 'nos-i-sinusi'),
    ('borova-iglichka', 'nos-i-sinusi'),
    ('smarchovi-vrahcheta', 'sezonna-grizha'),
    ('elhovi-vrahcheta', 'sezonna-grizha'),
    ('neven', 'vanshna-upotreba'),
    ('neven', 'kozha'),
    ('aloe-vera', 'vanshna-upotreba'),
    ('aloe-vera', 'kozha'),
    ('hamamelis', 'vanshna-upotreba'),
    ('arnika', 'stavi-i-muskuli'),
    ('arnika', 'vanshna-upotreba'),
    ('bosveliya', 'stavi-i-muskuli'),
    ('kopayba', 'vanshna-upotreba'),
    ('chaeno-darvo', 'vanshna-upotreba'),
    ('pachuli', 'vanshna-upotreba'),
    ('mira', 'vanshna-upotreba'),
    ('tamyan', 'vanshna-upotreba'),
    ('kedar', 'vanshna-upotreba'),
    ('sandalovo-darvo', 'vanshna-upotreba'),
    ('kopriva', 'kosa'),
    ('hvosht', 'kosa'),
    ('oreh-list', 'kosa'),
    ('rozmarin', 'kosa'),
    ('breza-list', 'urinaren-komfort'),
    ('tsarevichna-kosa', 'urinaren-komfort'),
    ('zlatna-pruchitsa', 'urinaren-komfort'),
    ('mecho-grozde', 'urinaren-komfort'),
    ('gluharche', 'cheren-drob-detoks-podkrepa'),
    ('gluharche', 'metabolitna-podkrepa'),
    ('byal-tran', 'cheren-drob-detoks-podkrepa'),
    ('artishok', 'cheren-drob-detoks-podkrepa'),
    ('kurkuma', 'cheren-drob-detoks-podkrepa'),
    ('kurkuma', 'antioksidantna-podkrepa'),
    ('leneno-seme', 'metabolitna-podkrepa'),
    ('sminduh', 'metabolitna-podkrepa'),
    ('cheren-kimion', 'antioksidantna-podkrepa'),
    ('chesan', 'metabolitna-podkrepa'),
    ('glog', 'energia-i-tonus'),
    ('kesten', 'stavi-i-muskuli'),
    ('kudzu', 'metabolitna-podkrepa'),
    ('zdravets', 'stres-i-balans'),
    ('limonova-treva', 'stres-i-balans'),
    ('limonova-treva', 'podpravki-i-aromatni-rastenia'),
    ('limonova-varbinka', 'stres-i-balans'),
    ('limonova-varbinka', 'san-i-relaks')
) as links(herb_slug, category_slug)
join public.herbs on herbs.slug = links.herb_slug
join public.categories on categories.slug = links.category_slug
on conflict (herb_id, category_id) do nothing;
