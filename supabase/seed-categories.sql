insert into public.categories (slug, name, description) values
(
  'hranosmilane',
  'Храносмилане',
  'Категория за билки и традиционни практики, които може да се свързват с храносмилателен комфорт. Информацията е образователна и не замества лечение.'
),
(
  'imunitet',
  'Имунитет',
  'Категория за сезонна и обща грижа. Билките не гарантират предпазване от заболяване и не заместват медицинска консултация.'
),
(
  'nervna-sistema',
  'Нервна система',
  'Категория за билки, традиционно използвани в спокойни ритуали и обща грижа за нервно напрежение. При силни симптоми потърсете специалист.'
),
(
  'dihatelna-sistema',
  'Дихателна система',
  'Категория за сезонни чайове и гаргари, свързани с гърло, кашлица и дихателен комфорт. Задухът и болката в гърдите изискват спешна помощ.'
),
(
  'kozha',
  'Кожа',
  'Категория за външна традиционна употреба и кожен комфорт. Рани, инфекции, силни обриви и алергични реакции изискват лекар.'
),
(
  'sarce-i-kravoobrashtenie',
  'Сърце и кръвообращение',
  'Категория, която изисква особено внимание заради възможни лекарствени взаимодействия. Не използвайте билки вместо кардиологична грижа.'
),
(
  'zhensko-zdrave',
  'Женско здраве',
  'Категория за традиционни теми, свързани с менструален комфорт и предпазни мерки. Бременност, кърмене и силна болка изискват консултация.'
),
(
  'obshta-grizha',
  'Обща грижа',
  'Категория за билки, храни и подправки, използвани като част от обща рутина. Те не заместват лечение или професионален съвет.'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.herb_categories (herb_id, category_id)
select herbs.id, categories.id
from (
  values
    ('layka', 'hranosmilane'),
    ('layka', 'nervna-sistema'),
    ('layka', 'obshta-grizha'),
    ('menta', 'hranosmilane'),
    ('menta', 'obshta-grizha'),
    ('matochina', 'nervna-sistema'),
    ('matochina', 'hranosmilane'),
    ('matochina', 'obshta-grizha'),
    ('zhalt-kantarion', 'nervna-sistema'),
    ('ehinatseya', 'imunitet'),
    ('ehinatseya', 'obshta-grizha'),
    ('lavandula', 'nervna-sistema'),
    ('lavandula', 'obshta-grizha'),
    ('kopriva', 'imunitet'),
    ('kopriva', 'obshta-grizha'),
    ('gradinski-chay', 'dihatelna-sistema'),
    ('gradinski-chay', 'obshta-grizha'),
    ('mashterka', 'dihatelna-sistema'),
    ('mashterka', 'imunitet'),
    ('rigan', 'hranosmilane'),
    ('rigan', 'dihatelna-sistema'),
    ('glog', 'sarce-i-kravoobrashtenie'),
    ('shipka', 'imunitet'),
    ('shipka', 'obshta-grizha'),
    ('neven', 'kozha'),
    ('byal-ravnec', 'hranosmilane'),
    ('byal-ravnec', 'zhensko-zdrave'),
    ('dzhindzhifil', 'hranosmilane'),
    ('dzhindzhifil', 'dihatelna-sistema'),
    ('aloe-vera', 'kozha'),
    ('baz', 'imunitet'),
    ('baz', 'dihatelna-sistema'),
    ('borovinka', 'obshta-grizha'),
    ('gluharche', 'hranosmilane'),
    ('gluharche', 'obshta-grizha'),
    ('zhensko-bile', 'dihatelna-sistema'),
    ('zhensko-bile', 'hranosmilane'),
    ('zelena-menta', 'hranosmilane'),
    ('kanela', 'hranosmilane'),
    ('kanela', 'obshta-grizha'),
    ('kurkuma', 'hranosmilane'),
    ('kurkuma', 'obshta-grizha'),
    ('leneno-seme', 'hranosmilane'),
    ('magdanoz', 'obshta-grizha'),
    ('rozmarin', 'hranosmilane'),
    ('rozmarin', 'nervna-sistema'),
    ('smradlika', 'kozha'),
    ('smradlika', 'dihatelna-sistema'),
    ('hvosht', 'obshta-grizha'),
    ('cheren-baz', 'imunitet'),
    ('cheren-baz', 'dihatelna-sistema'),
    ('chesan', 'imunitet'),
    ('chesan', 'sarce-i-kravoobrashtenie'),
    ('chesan', 'obshta-grizha')
) as links(herb_slug, category_slug)
join public.herbs on herbs.slug = links.herb_slug
join public.categories on categories.slug = links.category_slug
on conflict (herb_id, category_id) do nothing;
