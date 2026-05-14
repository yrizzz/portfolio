import axios from 'axios';

export default {
    "name": "blackboxAi",
    "category": "ai",
    "path": "/v1/ai/blackboxAi",
    "accept": "application/json",
    "method": "GET",
    "params": [
        {
            "mode": "body",
            "name": "prompt",
            "category": "form-data",
            "type": "string",
            "default": "Halo",
            "required": true
        }
    ],
    "description": "chat with blackboxAi",
    "example": `
const axios = require('axios').default;

const options = {
method: 'GET',
url: 'https://yrizzz.my.id/api/v1/ai/blackboxAi',
params: {prompt: 'Halo'},
headers: {Accept: '*/*', 'User-Agent': 'Thunder Client (https://www.thunderclient.com)'}
};

try {
const { data } = await axios.request(options);
console.log(data);
} catch (error) {
console.error(error);
}
`,
    "code": async (data) => {
        const { prompt, sessionId } = data;
        function randomString(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            return result;
        }
        const chat_id = sessionId ?? randomString(7);
        const message = [{
            'id': chat_id,
            'role': 'user',
            "content": prompt,
        }]
        let reply = '';

        try {
            let loop = true;
            let isContinue = 'start';
            while (loop) {
                await axios({
                    method: 'POST',
                    url: 'https://app.blackbox.ai/api/chat',
                    headers: {
                        'Cookie': 'sessionId=eef6d4b5-21d6-46a7-9975-a91d7a74a643; __stripe_mid=593893c8-788e-44a6-bb45-2995891e375cdc0856; intercom-id-x55eda6t=66b5bf43-a41a-4c4e-adb6-e15a0e91cf8b; intercom-device-id-x55eda6t=e06c634a-714a-4713-8c29-ff6b896e9540; __Host-authjs.csrf-token=5417befde09fde5d70883240cdcee6e6adb92466d93968c4395f41ea280e64cf%7C7733b60fdce20959e64148e29238d45e6b7c834a69b37db326a7a1daa0da9755; __Secure-authjs.callback-url=https%3A%2F%2Fapp.blackbox.ai; discount-dialog-shown=true; userCountry=%7B%22country%22%3A%22US%22%2C%22currency%22%3A%22USD%22%2C%22timestamp%22%3A1774665485161%2C%22expires%22%3A1775270285161%7D; __stripe_sid=ead589b2-bf60-4025-8120-e78f03ebaf20e68d70; next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiLWpRZ2lSMW5xQzN1a3A1NWRNeXk4bERUdDJRSGFSclhzR28yXzJxOWNGd0NtaWN0RGtZOEdfYm40WjhZUjRFN0QxRVZvR19DSm5mSEtHeGFkNmdrX2cifQ..DX_ZYz6lqLeY1FhKAD-SdA.gEfkLAeFRT7UM122gvHvs5fPW9DhwEL_8qA2ZxDnowbkzS8V1LgrhJeu6fwfMkv7bereem_4bhHnG0AQoCGw0y37SMTF8i3CBAbTZfOGxHci3ecxD-dZeqKRBwX5tuIJg_GW7WrJW7wmFZ36nV0T3NCfMLWTYkovLmOoy08DparZg3VczPPm26dT5krdeHt2wKlhbZQMgJz7IBkA8Cg9VzXN9S3vSk29qQNFzYd1FZUYVflGdWN6Qy2qDNL82AbUP9vss5qOdwgtcIy7dqICiKrHaac1YKD_l3ysSEvcyHfXZm_n35cUsN_3AV_rnhH3S5q5W6ROefNTl54iFK_vc0mB_WDPzRKrGR1FfYjPisNHPwdPjXt6-uKKVIfeOJGrkIn4LQ4K97TDGwCbjnWKl6wXGH7FvEOtu5HIQNQ-0QF37bZT8iRtsjdSmMZSSKSZ2BIpu9F53tUUXP8f_YoJr8EF_Kw--1C0bJWQqg7oYWM4IXv4GMR7WE-R9YhzWbsTtmxCK_WJTkJPchoMOAj7RVo_dZ_83Ii0hkt5rGKAQcrOmLMsXue3PGbFvIOp1gQrUEwP52UsRIukNj_UBzliZNFfjiAstLIYVfWrK-k_kB4.a4ZW1a8w67fm8FGenTyT14a5eJA4K8aBgTc4BZFChXg; ph_phc_9T0rgpbTO2ItkwbH8HNZuavYKcQ3h3wxzJwELM6JHV4_posthog=%7B%22%24device_id%22%3A%22019cc694-06c8-77d8-9df0-1342febc6723%22%2C%22distinct_id%22%3A%22019cc694-06c8-77d8-9df0-1342febc6723%22%2C%22%24sesid%22%3A%5B1774665534416%2C%22019d324e-3710-733d-a42b-4688f8237279%22%2C1774665479940%5D%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.blackbox.ai%2Fchat%2FbiWgKvt%22%7D%2C%22%24user_state%22%3A%22anonymous%22%7D',
                        'Origin': 'https://www.blackbox.ai',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36'
                    },
                    data: {
                        'messages': message,
                        "id": chat_id,
                        "previewToken": null,
                        "userId": null,
                        "codeModelMode": true,
                        "trendingAgentMode": {},
                        "isMicMode": false,
                        "userSystemPrompt": null,
                        "maxTokens": 1024,
                        "playgroundTopP": null,
                        "playgroundTemperature": null,
                        "isChromeExt": false,
                        "githubToken": "",
                        "clickedAnswer2": false,
                        "clickedAnswer3": false,
                        "clickedForceWebSearch": false,
                        "visitFromDelta": false,
                        "isMemoryEnabled": false,
                        "mobileClient": false,
                        "userSelectedModel": null,
                        "userSelectedAgent": "VscodeAgent",
                        "validated": "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
                        "imageGenerationMode": false,
                        "imageGenMode": "autoMode",
                        "webSearchModePrompt": false,
                        "deepSearchMode": false,
                        "domains": null,
                        "vscodeClient": false,
                        "codeInterpreterMode": isContinue,
                        "customProfile": {
                            "name": "",
                            "occupation": "",
                            "traits": [],
                            "additionalInfo": "",
                            "enableNewChats": true
                        },
                        "webSearchModeOption": {
                            "autoMode": true,
                            "webMode": false,
                            "offlineMode": false
                        },
                        "session": {
                            "user": {
                                "email": "adasolusix@gmail.com",
                                "id": "3a35a074-ff44-41be-85a9-4db1643b3053"
                            },
                            "expires": "2025-08-03T07:06:40.972Z",
                            "isNewUser": false
                        },
                        "isPremium": true,
                        "subscriptionCache": {
                            "status": "FREE",
                            "expiryTimestamp": null,
                            "lastChecked": 1751612569518,
                            "isTrialSubscription": false
                        },
                        "beastMode": false,
                        "reasoningMode": true,
                        "designerMode": true,
                        "workspaceId": chat_id,
                        "asyncMode": true,
                        "integrations": {},
                        "isTaskPersistent": false,
                        "selectedElement": null
                    }
                }).then(async (response) => {
                    let text = await response.data;
                    if ((/\$~~~\$/).test(text)) {
                        message.push(
                            {
                                'id': chat_id,
                                'role': 'assistant',
                                'content': text,
                                'createdAt': new Date()
                            }
                        )
                        isContinue = 'continue'
                    } else {
                        let tmpMsg;
                        loop = false;
                        message.push({
                            'id': chat_id,
                            content: text
                        })
                        let result = '';
                        message.map((item, index) => {
                            tmpMsg = item.content;
                            if (index != '0' || item.content != tmpMsg) {
                                result += item.content + ' ';
                            }
                        })

                        let tmp = ''
                        if ((/\$~~~\$(.*)\$~~~\$\n/g).test(result)) {
                            let array = result.match(/\$~~~\$(.*)\$~~~\$\n/g);
                            let text = result.replaceAll(array[0], '');
                            let split = result.toString().split(array[0])
                            text = split[split.length - 1]

                            let words = text.split(' ');
                            let uniqueWords = {};
                            let newText = '';

                            words.forEach(word => {
                                if (!uniqueWords[word]) {
                                    uniqueWords[word] = true;
                                    newText += word + ' ';
                                }
                            });

                            text = newText;

                            tmp += text.replaceAll('**', '*');
                            tmp += '\n\n🌐 Referensi terkait :\n\n'

                            array = JSON.stringify(array[
                                0]).replaceAll('$~~~$', '').replaceAll('\\n', '')
                            array = JSON.parse(JSON.parse(array));

                            array.map((item) => {
                                tmp += `» *Title* : ${item.title}\n» *Snippet* : ${item.snippet}\n» *Date* : ${item.date}\n» *Link* : ${item.link}\n\n`;
                            })
                        } else {
                            tmp = result.replace('$@$v=undefined-rv1$@$', '').replaceAll('**', '*');
                        }

                        reply = tmp.replace('Generated by BLACKBOX.AI, try unlimited chat https://www.blackbox.ai\n\n', '');

                    }

                }).catch(async (err) => {
                    loop = false;
                    return err
                })
            }
            
               reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            return { code: 200, status: true, message: 'success', data: reply };


        } catch (err) {
            return { code: 500, status: false, message: 'Internal server error' };
        }
    }
}
