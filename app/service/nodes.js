/**
 * @file service/nodes.js
 * @author huangzongzhe
 * 2018.08
 */
/* eslint-disable fecs-camelcase */
// const Service = require('egg').Service;
const insertTokenContract = require('../utils/insertTokenContract');
const BaseService = require('../core/baseService');
class NodesService extends BaseService {

    async getNodesInfo() {
        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const getQuery = 'select * from nodes_0';
        let nodesInfo = await this.selectQuery(aelf0, getQuery, []);
        return {
            list: nodesInfo
        };
    }

    async postNodesInfo(options) {
        let values = [];
        // contract_address, chain_id, api_ip, api_domain, rpc_ip, rpc_domain, token_name, owner, status
        let keys = [];
        for (const each in options) {
            values.push(options[each]);
            keys.push(each);
        }
        const valuesBlank = keys.map(() => '?');
        const keysStr = `(${keys.join(',')})`;
        const valuesStr = `(${valuesBlank.join(',')})`;

        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const table = 'nodes_0';

        const insertQuery = `insert into ${table} ${keysStr} VALUES ${valuesStr}`;

        let nodesInfo = await this.selectQuery(aelf0, insertQuery, values);

        const {api_domain, api_ip, contract_address} = options;
        const apiUrl = api_domain || api_ip;
        const contractResult = await insertTokenContract(this.ctx, apiUrl, contract_address, aelf0, 'contract_aelf20');

        return {
            list: nodesInfo,
            contract: contractResult
        };
    }

    async putNodesInfo(options) {
        const stringKeys = ['api_ip', 'api_domain', 'rpc_ip', 'rpc_domain', 'token_name', 'owner'];
        const intKeys = ['status'];

        let setSqlSnippets = [];
        stringKeys.map(item => {
            const itemValue = options[item];
            if (options[item]) {
                setSqlSnippets.push(` ${item}="${itemValue}" `);
            }
        });
        intKeys.map(item => {
            const itemValue = options[item];
            if (options[item] || options[item] === 0) {
                setSqlSnippets.push(` ${item}=${itemValue} `);
            }
        });

        const setSqlSnippetsString = setSqlSnippets.join(',');

        const aelf0 = this.ctx.app.mysql.get('aelf0');
        const table = 'nodes_0';

        const updateSql = `UPDATE ${table} SET ${setSqlSnippetsString}`
            + `WHERE contract_address="${options.contract_address}" and chain_id="${options.chain_id}";`;

        const nodesInfo = await this.selectQuery(aelf0, updateSql, []);
        return {
            nodesInfo
        };
    }
}

module.exports = NodesService;
