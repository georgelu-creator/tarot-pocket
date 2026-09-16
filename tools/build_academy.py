#!/usr/bin/env python3
"""Compile only explicitly learner-facing LM-1.0-R3 scripts into offline data.
No Markdown renderer or network is used. Fail closed when a script is incomplete.
"""
from pathlib import Path
import re, json, hashlib
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'docs/LEARNING_MASTER.md'
src=SOURCE.read_text()
def clean(s):
    s=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',s)
    return re.sub(r'\s+',' ',s.replace('**','').replace('`','')).strip(' \n「」')
def pair(s):
    s=clean(s)
    s=re.sub(r'^(?:答对了\s*/\s*Correct\.|这项不对\s*/\s*Not correct\.)\s*','',s)
    parts=re.split(r'\s*/\s+(?=[A-Za-z“"\d])',s,maxsplit=1)
    if len(parts)!=2: raise ValueError('Missing bilingual pair: '+s[:160])
    return {'zh':parts[0].strip(),'en':re.sub(r'^[AB] is (?:correct|incorrect):\s*', '', parts[1].strip())}
def labeled(s):
    return [{'zh':clean(a),'en':clean(b)} for a,b in re.findall(r'\*\*中\*\*[：:]\s*(.*?)\n\s*\*\*EN\*\*[：:]\s*([^\n]+)',s,re.S)]
def extract(s,start,end=None):
    i=s.index(start)+len(start)
    return s[i:s.index(end,i)] if end else s[i:]
def firstpara(s):
    return next(x for x in re.split(r'\n\s*\n',s.strip()) if x and not x.startswith('<'))
def question(qid,prompt,options,correct):
    out={'id':qid,'prompt':prompt,'options':[]}
    assert len(options)>=2 and correct in options,(qid,options,correct)
    for letter,(text,feedback) in options.items():
        # The UI supplies the result and supported answer. Keep the authored
        # explanation once, removing only those exact presentation wrappers.
        feedback=dict(feedback)
        for lang in ('zh','en'):
            reason=feedback[lang]
            reason=re.sub(r'^(?:答对了[。！]?|这题不对[。！]?|Correct\.|Not quite\.)\s*','',reason)
            answer=options[correct][0][lang]
            for prefix in ('本题应选：','The supported answer is: '):
                if reason.startswith(prefix+answer):reason=reason[len(prefix+answer):].lstrip()
            if reason.startswith(answer):
                tail=reason[len(answer):]
                if tail and (tail[0].isspace() or tail[0] in '。.!！'):
                    reason=tail.lstrip(' 。.!！')
            if reason:feedback[lang]=reason
        # Semantic identity travels with option text, never with its display order.
        oid=qid+'-'+hashlib.sha256(text['zh'].encode()).hexdigest()[:10]
        out['options'].append({'id':oid,'text':text,'feedback':feedback})
        if letter==correct:out['correct']=oid
    return out
lessons=[]
headers=list(re.finditer(r'^### ([BIA]\d\d)｜(.+)$',src,re.M))
for ix,m in enumerate(headers):
    uid=m[1];body=src[m.end():headers[ix+1].start() if ix+1<len(headers) else src.index('### 逐课内容',m.end()) if '### 逐课内容' in src[m.end():] else src.index('<a id="card-index"',m.end()) if '<a id="card-index"' in src[m.end():] else src.index('### m00',m.end())]
    teachings=[pair(x) for x in re.findall(r'\*\*'+uid+r'-T\d\*\*「(.*?)」',body)]
    if uid=='I04':
        extra=re.search(r'\n  「(.*?)」',body)
        assert extra, 'I04 must teach the supplied Nine of Swords example'
        teachings.insert(1,pair(extra[1]))
    if uid=='A06':
        positions=[{'zh':clean(a),'en':clean(e)} for a,e in re.findall(r'^\| (\d+ [^|]+) \| ([^|]+) \|$',body,re.M)]
        assert len(positions)==10, 'Celtic Cross must teach all ten actual position meanings'
        teachings[2:2]=positions
    qs={}
    for line in body.splitlines():
        mt=re.match(r'\| '+uid+r'-(Q\d)「(.*?)」 \| (.*?) \| ([AB])',line)
        if mt:
            opts={a:(pair(b),pair(c)) for a,b,c in re.findall(r'([AB])「(.*?)」→「(.*?)」',mt[3])}
            qs[mt[1]]=question(uid+'-'+mt[1],pair(mt[2]),opts,mt[4])
    rem={}
    for r in re.finditer(r'\*\*'+uid+r'-(R\d) 教学\*\*「(.*?)」(.*?)(?=\n- \*\*|\n\*\*'+uid+r'-V|\n\*\*完成)',body,re.S):
        txt=r[3];p=re.search(r'题「(.*?)」',txt);ans=re.search(r'答案\s*([AB])',txt)
        opts={a:(pair(b),pair(c)) for a,b,c in re.findall(r'([AB])「(.*?)」→「(.*?)」',txt)}
        rem[r[1]]={'teach':[pair(r[2])],'question':question(uid+'-'+r[1],pair(p[1]),opts,ans[1])}
    v=re.search(r'\*\*'+uid+r'-V1[^*]*\*\*「(.*?)」(.*?)(?=\n\*\*完成)',body,re.S)
    opts={a:(pair(b),pair(c)) for a,b,c in re.findall(r'([AB])「(.*?)」→「(.*?)」',v[2])}
    visit=question(uid+'-V1',pair(v[1]),opts,re.search(r'答案\s*([AB])',v[2])[1])
    recap=pair(re.search(r'\*\*完成\*\*「(.*?)」',body)[1])
    cards=re.findall(r'\b[mwcsp]\d{2}\b',body.split('**分镜')[0])
    lessons.append({'id':uid,'kind':'lesson','level':uid[0],'title':pair(m[2]),'teachings':teachings,'questions':qs,'remediation':rem,'revisit':visit,'summary':recap,'cards':list(dict.fromkeys(cards))})
# Restrict to first authored scripts; the Word-baseline appendix is not runtime copy.
cardstart=src.index('<a id="card-m00">')
cardend=src.index('<a id="coverage',cardstart) if '<a id="coverage' in src[cardstart:] else src.index('## 10.',cardstart)
cardtext=src[cardstart:cardend]
headers=list(re.finditer(r'^### ([mwcsp]\d\d)(?:｜| · )(.+)$',cardtext,re.M))
cards=[]
for ix,m in enumerate(headers):
    uid=m[1];b=cardtext[m.end():headers[ix+1].start() if ix+1<len(headers) else len(cardtext)]
    title=pair(m[2]) if ' / ' in m[2] else {'zh':m[2].split(' · ')[0],'en':m[2].split(' · ')[1]}
    qs={};rem={}
    if uid[0]=='m':
        t1=pair(firstpara(extract(b,'**'+uid+'-T1 完整含义 / Meaning**','**画面联系')))
        visual=pair(firstpara(extract(b,'**画面联系 / Picture connection**','**关键词整理')))
        words=pair(firstpara(extract(b,'**关键词整理 / Recall labels**','**'+uid+'-T2')))
        t2=pair(firstpara(extract(b,'**'+uid+'-T2 正位应用 / Upright application**','**'+uid+'-T3')))
        t3=pair(firstpara(extract(b,'**'+uid+'-T3 后续逆位深化 / Later reversal study**','**分镜')))
        for key in ['Q1','Q2','Q3','R1','R2','R3','V1']:
            qblock=extract(b,'**'+uid+'-'+key+'**')
            qblock=qblock[:qblock.index('答案：')+6]
            prompt=pair(firstpara(qblock[qblock.index('\n')+1:]))
            opts={a:(pair(t),pair(f)) for a,t,f in re.findall(r'^\| ([AB]) \| (.*?) \| (.*?) \|$',qblock,re.M)}
            q=question(uid+'-'+key,prompt,opts,re.search(r'答案：([AB])',qblock)[1])
            if key.startswith('R'):
                teach=pair(firstpara(extract(b,'**'+uid+'-'+key+' 替代讲解 / Alternative explanation**','<a id="'+uid+'-'+key.lower()+'"')))
                rem[key]={'teach':[teach],'question':q}
            elif key=='V1':visit=q
            else:qs[key]=q
        teachings=[t1,visual,words];summary=t1
    elif uid[0] in 'wc':
        def quote(after):
            block=extract(b,after);return {'zh':clean(re.search(r'^> (.+)$',block,re.M)[1]),'en':clean(re.findall(r'^> (.+)$',block,re.M)[1])}
        t1=quote('**先讲主要含义 / Teach the core meaning**')
        t2=quote('**先看应用示范 / Read the worked application**')
        t3=quote('**后续深化：先教本例逆位 / Later extension: teach this reversal first**')
        visual=pair(re.search(r'\*\*画面助记 / Visual memory support\*\*：([^\n]+)',b)[1])
        words=pair(re.search(r'\*\*结构辅助 / Structural aid\*\*：([^\n]+)',b)[1])
        # Auxiliary labels can contain more than one bilingual sentence: preserve both languages independently.
        aux=re.search(r'\*\*辅助词 / Organising words\*\*：([^\n]+)',b)[1]
        pieces=re.split(r'\s*/\s*',aux);words={'zh':clean(pieces[0])+' '+words['zh'],'en':clean(pieces[1].split('先理解')[0])+' '+words['en']}
        for key in ['Q1','Q2','Q3','R1','RA','R2','V1']:
            start='<a id="'+uid+'-'+key.lower()+'"></a>';block=extract(b,start);block=block.split('<a id=')[0]
            p=re.search(r'\*\*(?:题目 / Prompt|新题 / New prompt)\*\*：([^\n]+)',block)[1]
            rawopts={a:pair(t) for a,t in re.findall(r'^- ([AB])．([^\n]+)',block,re.M)}
            feedback={a:pair(t) for a,t in re.findall(r'^- ([AB]) (?:正确|不对)：([^\n]+)',block,re.M)}
            correct=re.search(r'^- ([AB]) 正确：',block,re.M)[1]
            q=question(uid+'-'+key,pair(p),{a:(t,feedback[a]) for a,t in rawopts.items()},correct)
            if key.startswith('R'):
                rem[key]={'teach':[pair(re.search(r'\*\*替代补讲 / Alternative explanation\*\*：([^\n]+)',block)[1])],'question':q}
            elif key=='V1':visit=q
            else:qs[key]=q
        teachings=[t1,visual,words];summary=t1
    else:
        t1block=extract(b,'#### T1','#### 动画分镜');teachings=labeled(t1block);visual=teachings[1]
        t2=labeled(extract(b,'#### T2','#### '+uid+'-Q2'))[0]
        t3=labeled(extract(b,'#### T3','#### '+uid+'-Q3'))[0]
        for key in ['Q1','Q2','Q3','R1','R2','R3','V1']:
            marker='#### '+uid+'-'+key+('-CHECK' if key.startswith(('R','V')) else '')+' ·'
            block=extract(b,marker).split('\n#### ')[0]
            prompt=labeled(block)[0]
            texts={a:pair(t) for a,t in re.findall(r'^- ([AB])\. ([^\n]+)',block,re.M)}
            feeds={a:pair(t) for a,t in re.findall(r'^- 选择 ([AB]) 的反馈：([^\n]+)',block,re.M)}
            q=question(uid+'-'+key,prompt,{a:(t,feeds[a]) for a,t in texts.items()},re.search(r'\*\*答案：([AB])',block)[1])
            if key.startswith('R'):
                rem[key]={'teach':labeled(extract(b,'#### '+uid+'-'+key+' ·',marker)),'question':q}
            elif key=='V1':visit=q
            else:qs[key]=q
        summary=labeled(extract(b,'**学习总结 / Learning summary**'))[0]
    for key,q in qs.items():q['support']='RA' if uid[0] in 'wc' and key=='Q2' else 'R2' if uid[0] in 'wc' and key=='Q3' else 'R'+key[1]
    cards.append({'id':uid,'kind':'card','level':'I','title':title,'teachings':teachings,'application':t2,'reversal':t3,'visual':visual,'questions':qs,'remediation':rem,'revisit':visit,'summary':summary,'cards':[uid]})
for u in lessons:
    for k,q in u['questions'].items():q['support']='R'+k[1]
# Fixed image examples for method lessons, taught explicitly by the source scripts.
examples={'B01':['p08','c12','m08'],'B02':['p08'],'B03':[],'B04':['p08'],'B05':['p11'],'B06':['p08'],'B07':['c02','m08'],'B08':['c02'],'I01':['p08'],'I02':['c10'],'I03':['c12'],'I04':['s09','p08'],'I05':['p08'],'I06':['c12','p08','c10'],'A01':[],'A02':['c02','s02','m14'],'A03':['p11','c07','p08'],'A04':['p11','p08','p12'],'A05':['p02','p03','w11','p08','w10'],'A06':['p03','w05','m19','p06','w11','p12','m01','m05','s09','w04']}
for u in lessons:u['cards']=examples[u['id']]
learner_titles=[('认识这 78 张牌','Meet the 78 cards'),('从洗牌到解读','From shuffling to reading'),('四种花色分别讲什么','What the four suits describe'),('数字能告诉我们什么','What the numbers can tell us'),('认识宫廷牌','Meet the court cards'),('读懂星币八','Understand the Eight of Pentacles'),('认识圣杯二和力量','Meet the Two of Cups and Strength'),('试着用一张牌给建议','Give advice with one card'),('怎样读懂一张牌','How to understand a card'),('读懂圣杯十','Understand the Ten of Cups'),('把宫廷牌放进问题里','Read court cards in a question'),('逆位应该怎样读','How to read reversals'),('同一张牌，换个问题怎么读','Read one card in different questions'),('试着把三张牌一起读','Read three cards together'),('把想问的事说清楚','Make your question clear'),('看清每张牌在回答什么','Know what each position answers'),('把三张牌连起来回答','Answer with three connected cards'),('整组牌里有逆位怎么办','Read reversals within a spread'),('两个选择怎么比较','Compare two choices'),('一步步读凯尔特十字','Read the Celtic Cross step by step')]
for u,(zh,en) in zip(lessons,learner_titles):
    u['title']={'zh':zh,'en':en}
assert len(lessons)==20 and len(cards)==78,(len(lessons),len(cards))
for u in lessons+cards:
    assert len(u['teachings'])>=3,u['id']
    assert len(u['questions'])==(2 if u['kind']=='lesson' else 3),u['id']
    assert len(u['remediation'])==(2 if u['kind']=='lesson' else 3),u['id']
    for q in [*u['questions'].values(),*[r['question'] for r in u['remediation'].values()],u['revisit']]:
        assert q['correct'] in [o['id'] for o in q['options']]
        assert len({o['text']['zh'] for o in q['options']})==len(q['options']),q['id']
    for x in u['teachings']:
        assert not re.search(r'已教依据|补学路由|内容ID|本稿|验收|编写者|触发与范围',x['zh']),u['id']
data={'version':'LM-1.0-R3.2','source':'docs/LEARNING_MASTER.md','sourceHash':hashlib.sha256(src.encode()).hexdigest(),'lessons':lessons,'cards':cards}
(ROOT/'academy-content.js').write_text('/* Generated by tools/build_academy.py. Learner copy only; edit the source script. */\nwindow.TAROT_ACADEMY_CONTENT='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
# Mirror source-authored translations into the existing locale workflow.
pairs={}
def collect(v):
    if isinstance(v,dict):
        if set(v)=={'zh','en'}:pairs[v['zh']]=v['en']
        else:
            for x in v.values():collect(x)
    elif isinstance(v,list):
        for x in v:collect(x)
collect(data)
(ROOT/'locales/en-learning-v2.json').write_text(json.dumps(pairs,ensure_ascii=False,indent=2)+'\n')
print(f'Compiled {len(lessons)} lessons, {len(cards)} cards, {len(pairs)} bilingual text pairs.')
